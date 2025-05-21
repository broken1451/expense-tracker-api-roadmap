import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditCard, CreditCardShema } from './entities/credit-card.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeatureAsync([
      {
        name: CreditCard.name,
        collection: 'tdc',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = CreditCardShema;
          return schema;
        }
      }
    ])
  ],
})
export class CreditCardsModule { }
