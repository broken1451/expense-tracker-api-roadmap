import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense ,ExpenseShema} from '@entitiesExpenses/expense.entity';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeatureAsync([
      {
        name: Expense.name,
        collection: 'expenses',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = ExpenseShema;
          return schema;
        }
      }
    ])
  ],
  exports: []
})
export class ExpensesModule {}
