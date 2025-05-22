import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { isValidObjectId, Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Auth } from '../entities/auth.entity';
import { JwtInterface } from '../interface/jwt.interface';

@Injectable()
export class StrategyService extends PassportStrategy(Strategy) {


    constructor(private readonly configService: ConfigService, @InjectModel(Auth.name) private readonly userModel: Model<Auth>){
        super({
            secretOrKey: configService.get('jwt.secret') || process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload: JwtInterface): Promise<any> { 

        let { id } = payload;   

        if (!isValidObjectId(id)) {
            throw new BadRequestException(`${id} no es a valid mongo id`);
        }

        const userDb = await this.userModel.findById(id);
        if (!userDb) {
            throw new UnauthorizedException('Token no valid');
        }

        if (!userDb.isActive) {
            throw new UnauthorizedException('User is inactive. talk with an admin');
        }
        
        return userDb
    }
}