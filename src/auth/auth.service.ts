import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { rolesPermited } from './utils/roles-permited';
import { JwtInterface } from './interface/jwt.interface';
import { LoginhDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  private readonly rolesPermited: string[] = [
    'ADMIN',
    'USER',
  ];

  constructor(
    @InjectModel(Auth.name) private readonly userModel: Model<Auth>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  async create(createAuthDto: CreateAuthDto) {
    let { name, email, password, last_name, ...restProperties } = createAuthDto;

    name = name.toLowerCase().trim();
    email = email.toLowerCase().trim();
    last_name = last_name.toLowerCase().trim();


    let userExist: Auth;
    if (email) {
      userExist = await this.userModel.findOne({ email });
      if (userExist) {
        throw new BadRequestException(
          `The user already exists in the database with the email ${userExist.email}`,
        );
      }
    }

    const saltOrRounds = 10;
    password = bcrypt.hashSync(password, saltOrRounds);

    if (!restProperties?.roles) {
      restProperties.roles = ['USER'];
    }

    if (restProperties?.roles.length == 0) {
      restProperties.roles = ['ADMIN'];
    }


    let rolesPermit = rolesPermited(restProperties?.roles, this.rolesPermited);
    restProperties.roles = rolesPermit;

  
    const userCreated: Auth = await this.userModel.create({
      name,
      last_name,
      email,
      password,
      ...restProperties,
    }).catch((error) => {
      console.log (error);
      throw new BadRequestException("Error to create user, the email is already in use");
    });

    const returnUserCreated = await this.findOne(userCreated._id.toString());
    return returnUserCreated.toObject();
  }

  async findAll() {
    const users = await this.userModel.find({}, '-password  -__v').sort({ created_at: 1 }).limit(5);
    const countsUser = await this.userModel.countDocuments({});
    return { users, countsUser };
  }

  async findOne(id: string) {
    
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`${id} no es a valid mongo id`);
    }

    const userDB = await this.userModel.findOne({ _id: id }, '-password -__v');

    if (!userDB) {
      throw new BadRequestException(`The user with the id ${id} does not exist`);
    }

    return userDB;
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {

    let {name, last_name, email, updated,  ...rest} = updateAuthDto;
    name = name.toLowerCase().trim();
    email = email.toLowerCase().trim();
    last_name = last_name.toLowerCase().trim();

    await this.findOne(id);
    if (updateAuthDto.roles) {
      updateAuthDto.roles = rolesPermited(updateAuthDto.roles, this.rolesPermited);
    }

    updated = Date.now();
    if (rest.password) {
      const saltOrRounds = 10;
      rest.password = bcrypt.hashSync(rest.password, saltOrRounds);
    }
    
    const userUpdate = await this.userModel.findByIdAndUpdate(
      id,
      { update_at: Date.now(), name, last_name, email, updated, ...rest },
      { new: true, select: '-password -__v' },
    );
    
    if (!userUpdate) {
      throw new BadRequestException(`El usuario con el id ${id} no existe`);
    }

    return userUpdate;
  }

  async remove(id: string) {

    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException(`El usuario con el id ${id} no existe`);
    }
    user.isActive = false;
    user.update_at = Date.now();
    const userUpdate = await this.userModel.findByIdAndUpdate(id, user, {
      new: true,
      select: '-password -__v'
    });

    return userUpdate;
  }

  async login(loginAuthDto: LoginhDto) {
    const { email, password } = loginAuthDto;
    const user = await this.userModel.findOne({ email }).select('-user.password');

    if (!user) {
      throw new BadRequestException(`The user with the email ${email} does not exist`);
    }
    if (!user.isActive) {
      throw new BadRequestException(`The user with the email ${email} is not active`);
    }

    if (user.retry >= 3) {
      throw new BadRequestException(`The user with the email ${email} is blocked`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      user.retry = user.retry + 1;
      await user.save();
      throw new BadRequestException(`The password is incorrect`);
    }

    user.retry = 0;
    await user.save()

    const userFound = await this.findOne(user._id.toString());
    return {
      ok: true,
      user: userFound,
      token: this.getJWT({ id: user._id.toString() }),
    };
  }


  private getJWT(payload: JwtInterface): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
