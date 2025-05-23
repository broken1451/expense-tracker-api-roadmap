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
        if (!configService.get('mongo.url') && !process.env.URI) {
          throw new Error('MongoDB URI is not defined in the environment variables or config file');
        }

        let uri = '';
        let dbName = '';
        if (process.env.STAGE === 'development') {
          uri = String(configService.get('mongo.url')) 
          dbName = String(configService.get('mongo.dbName'))
        } else if (process.env.STAGE === 'production') {
          uri = String(process.env.URI)
          dbName = String(process.env.DBNAME)
        }
        
        return {
          uri,
          dbName
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
