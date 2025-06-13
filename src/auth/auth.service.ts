import { BadRequestException, Injectable, Body, Logger } from '@nestjs/common';
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
import { LoginhDto, LoginhDtoGoogle } from './dto/login.dto';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';

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
    let { name, email, password, last_name, salary, ...restProperties } = createAuthDto;

    if (!name || !email || !password || !last_name) {
      const missingFields = ['name', 'email', 'password', 'last_name'].filter(field => !createAuthDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }

    name = name.toLowerCase().trim();
    email = email.toLowerCase().trim();
    last_name = last_name.toLowerCase().trim();
    salary = Number(salary.toString().trim());


    let userExist: Auth;
    if (email) {
      userExist = await this.userModel.findOne({
        email,
        isActive: true,
        google: false
      });
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
      salary,
      ...restProperties,
    });

    const returnUserCreated = await this.findOne(userCreated._id.toString());
    return {returnUserCreated, token: this.getJWT({ id: userCreated._id.toString() })};
  }

  async findAll(page?: string) {
    const users = await this.userModel.find({}, '-password  -__v').sort({ created_at: 1 }).limit(20).skip(Number(page) || 0);
    const countsUser = await this.userModel.countDocuments({});
    return { users, totalUser: countsUser, userLenght: users.length };
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

    let {name, last_name, email,salary, ...rest} = updateAuthDto;
    if (!name || !email || !last_name) {
      const missingFields = ['name', 'email', 'last_name'].filter(field => !updateAuthDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }

    name = name.toLowerCase().trim();
    email = email.toLowerCase().trim();
    last_name = last_name.toLowerCase().trim();
    salary = Number(salary.toString().trim());

    const user = await this.findOne(id);
    if (updateAuthDto.roles) {
      updateAuthDto.roles = rolesPermited(updateAuthDto.roles, this.rolesPermited);
      rest.roles = updateAuthDto.roles;
    }

    if (rest.password) {
      const saltOrRounds = 10;
      rest.password = bcrypt.hashSync(rest.password, saltOrRounds);
    }
    
    let userUpdate: Auth;
    try {
       userUpdate = await this.userModel.findByIdAndUpdate(
        id,
        { update_at: Date.now(), name, last_name, email,salary, ...rest },
        { new: true, select: '-password -__v' },
      );

      if (!userUpdate) {
        throw new BadRequestException(`El usuario con el id ${id} no existe`);
      }

    } catch (error) {
      throw new BadRequestException(`Error updating user: ${error.message}`);
    }

    user.retry = 0;
    user.save();
    return userUpdate;
  }

  async updatePassword(updateAuthDto: UpdateAuthDto) {

    let {password, email} = updateAuthDto;
    if (!password || !email) {
      const missingFields = ['password', 'email'].filter(field => !updateAuthDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }

    email = email.toLowerCase().trim();
    password = password.toLowerCase().trim();

    const user: Auth =  await this.userModel.findOne({email}).exec();
    if (!user) {
      throw new BadRequestException(`El usuario con el email ${email} no existe`);
    }
  
    const saltOrRounds = 10;
    password = bcrypt.hashSync(password, saltOrRounds);
    user.retry = 0;
    user.password = password;
    user.update_at = Date.now();
    await user.save();
    
    await this.sendEmail(updateAuthDto);
    return {ok: true, message: 'Password updated successfully'};
  }

  async remove(id: string) {

    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException(`El usuario con el id ${id} no existe`);
    }

    if (!user.isActive) {
      throw new BadRequestException(`El usuario con el id ${id} ya esta eliminado`);
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
    let { email, password } = loginAuthDto;
    email = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email }).select('-name -last_name -email -created_at -update_at -roles -__v'); 

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
    user.update_at_login = Date.now();
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

  async sendEmail(updateAuthDto: UpdateAuthDto) {
    let {email} = updateAuthDto;
    const templatePath = path.join(__dirname, './template/template_email.html');
    if (!email) {
      const missingFields = ['email'].filter(field => !updateAuthDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }
    const transporter = nodemailer.createTransport({
      service: this.configService.get('email.service') || process.env.EMAIL_SERVICE,
      host: this.configService.get('email.host') || process.env.EMAIL_HOST,
      port: this.configService.get('email.port') || Number(process.env.EMAIL_PORT),
      secure: false, // true for port 465, false for other ports
      auth: {
        user: this.configService.get('email.auth.user') || process.env.EMAIL_USER,
        pass: this.configService.get('email.auth.pass') || process.env.EMAIL_PASS,
      },
    });

    let datos: any = updateAuthDto
    datos.email = email;
    datos.password = updateAuthDto.password
    const dayjs = require('dayjs')
    datos.fecha = dayjs().format('DD/MM/YYYY');

    const html = fs.readFileSync(path.resolve(templatePath), 'utf8'); 
    const templateMapped = ejs.render(html, datos);

    await transporter.sendMail({
      from: {
        name: this.configService.get('email.from.name') || process.env.EMAIL_FROM_NAME,
        address: this.configService.get('email.from.address') || process.env.EMAIL_FROM_ADDRESS,
      }, 
      to: [`${email}`],
      subject: this.configService.get('email.subject') || process.env.EMAIL_SUBJECT,
      html: `${templateMapped}`,
    });
  }
  
  async sizeDB() {
    const stats = await this.userModel.db.db.stats();
    const bdSize = stats.storageSize / 1024 / 1024;
    return {
      ok: true,
      dbName: stats.db,
      bdSize: `${bdSize.toFixed(2)} MB`
    }
  }

  public async loginGoogle(req: LoginhDtoGoogle) {
    const logger = new Logger('AuthService');
    let clientId = '';
    if (process.env.STAGE === 'development') {
      clientId = this.configService.get<string>('google.clientId')
    } else if (process.env.STAGE === 'production') {
      clientId =  process.env.GOOGLE_CLIENT_ID
    } else {
      throw new BadRequestException('Client ID is not configured');
    }
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: req.token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    const userExist = await this.userModel.findOne({ google: req.google, email: payload.email, isActive: true });
    if (userExist) {
      return {
        ok: true,
        user: userExist,
        exist: true,
        token: this.getJWT({ id: userExist._id.toString() }),
      };
    }

    const userToCreate: CreateAuthDto = {
      name: payload.name,
      last_name: payload.family_name,
      email: payload.email,
      password: "123456",
      roles: [],
      google: req.google,
      salary: 0,
    }

    const userNewGoogle = await this.create(userToCreate);
    // logger.log("no existe el usuario, se creara uno nuevo", userToCreate);
    return userNewGoogle;
  }
}
