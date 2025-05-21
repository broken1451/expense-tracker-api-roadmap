import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthShema } from './entities/auth.entity';
import { StrategyService } from './strategy/strategy.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, StrategyService],
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => { // se inyecta el servicio como en cualquier constructor o cualquier clases, solo q aca es una funcion 
        return {
          secret: configService.get('jwt.secret') || '',
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn') || ''
          }
        }
      } // es la funcion que voy a mandar a llamar cuando se intente registrar de manera asincrono el modulo 
    }),
    MongooseModule.forFeatureAsync([
      {
        name: Auth.name,
        collection: 'auths',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = AuthShema;
          return schema;
        }
      }
    ])
  ],
  exports: [MongooseModule, AuthService, ConfigModule, PassportModule, JwtModule, StrategyService]
})
export class AuthModule { }
