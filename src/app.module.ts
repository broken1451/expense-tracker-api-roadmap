import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import conf from './conf/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesModule } from './expenses/expenses.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      load: [conf],
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(String(process.env.URI))
        return {
          uri: String(configService.get('mongo.url')) || String(process.env.URI),
          dbName: String(configService.get('mongo.dbName')) || String(process.env.DBNAME)
        }
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ExpensesModule,
    CreditCardsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
