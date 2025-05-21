import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '@entitiesExpenses/expense.entity';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Si quieres trabajar con la configuración regional en español
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ExpenseDateLastWeekDto } from './dto/expense.dates.dto';
import { isValidObjectId } from 'mongoose';
import { Auth } from 'src/auth/entities/auth.entity';
import { AuthService } from 'src/auth/auth.service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
dayjs.tz.setDefault('America/Santiago');

@Injectable()
export class ExpensesService {

  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    private readonly authService: AuthService,
  ) { }

  async create(createExpenseDto: CreateExpenseDto) {

    let { description, category, amount, date, totalAmount, totalIncome, balance, ...rest } = createExpenseDto;

    if (!description || !category || !amount || !date ) {
      const missingFields = ['description', 'category', 'amount', 'date'].filter(field => !createExpenseDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }

    description = description.toLowerCase().trim();
    category = category.toLowerCase().trim();
    amount = Number(amount.toString().trim());
    date = dayjs(date).toDate();

    try {
      const expenseCreated: Expense = await this.expenseModel.create({
        description,
        category,
        amount,
        date,
        totalAmount,
        totalIncome,
        balance,
        ...rest
      });
      return expenseCreated;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new BadRequestException(`Error creating expense: ${error.message}`);
    }
  }

  async findAll(page: string, req?: Request) {
    
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);   
    const expenses = await this.expenseModel.find({}, ' -__v').where('user').equals(userFound._id).sort({ created_at: 1 }).limit(20).skip(Number(page) || 0).limit(20);
    // const expenses = await this.expenseModel.find({}, ' -__v').sort({ created_at: 1 }).limit(20).skip(Number(page) || 0).limit(20);
    const countsTotalExpenses = await this.expenseModel.countDocuments({});
    return { expenses, totalExpenses: countsTotalExpenses, userLenght: expenses.length, totalIngress: 4000000 };
    // return expenses
  }

  async findOne(id: string, req?: Request) {

    if (!isValidObjectId(id)) {
      throw new BadRequestException(`The expense with id ${id} does not valid mongo id`);
    }  

    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);

    const expenseFound = await this.expenseModel.findById(id).where('user').equals(userFound.id).exec();
    if (!expenseFound) {
      throw new BadRequestException(`The expense with the id ${id} does not exist`);
    }

    return  expenseFound;
  }

 async update(id: string, updateExpenseDto: UpdateExpenseDto, req?: Request) { 
    const { description, category, amount, ...rest } = updateExpenseDto;

    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const expenseFound = await this.findOne(id, req)
    if (!expenseFound) {
      throw new BadRequestException(`The expense with the id ${id} does not exist`);
    }

    const expenseUpdated = this.expenseModel.findByIdAndUpdate(id, {
      description: description.toLowerCase().trim(),
      category: category.toLowerCase().trim(),
      amount: Number(amount.toString().trim()),
      update_at: Date.now(),
      ...rest
    }, { new: true }).where('user').equals(userFound._id).exec();

    return expenseUpdated;
  }

  async remove(id: string, req: Request) {
    
    const expenseFound = await this.findOne(id, req);
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);

    if (!expenseFound) {
      throw new BadRequestException(`The expense with the id ${id} does not exist`);
    }
    // await this.expenseModel.findOneAndDelete({ _id: id }, { new: true });
    await this.expenseModel.findByIdAndDelete(id).where('user').equals(userFound._id).exec();
    return {
      message: `The expense was deleted`
    }
  }

  async findUserByTerm(term: string, desde: string = '0') {
    let expRegular = new RegExp(term, 'i');
    const expensesFound = await this.expenseModel.find(
      {
        $or:
          [
            { description: expRegular || "" }
          ]
      }, {}
    )
      .skip(Number(desde))
      .limit(5)
      .sort({ created: 1 });
    const countsExpenses = await this.expenseModel.countDocuments({
      description: expRegular,
    });
    return { expensesFound, countsExpenses, totalExpenses: expensesFound.length };
  }


  async findUserByLastWeek(req?: Request) {
    const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
    
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const expenses = await this.expenseModel.find({
      date: {
        $gte: sevenDaysAgo
      },
    }).where('user').equals(userFound._id).sort({ date: -1 }).exec();
    return { expenses, totalExpenses: expenses.length };
  }

  /**
   * Busca los gastos del último mes.
   * @returns Un objeto que contiene los gastos y el total de gastos encontrados.
   */
  async findUserByLasMoth(req?: Request) {
    const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const expenses = await this.expenseModel.find({
      date: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    }).where('user').equals(userFound._id).sort({ date: -1 }).exec();
  
    return { expenses, totalExpenses: expenses.length };
  }

  async findUserByLas3Months(req?: Request){

    const startOfLast3Months = dayjs().subtract(3, 'month').startOf('month');
    const endOfLast3Months = dayjs().subtract(1, 'month').endOf('month');
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const expenses = await this.expenseModel.find({
      date: {
        $gte: startOfLast3Months,
        $lte: endOfLast3Months,
      },
    }).where('user').equals(userFound._id).sort({ date: -1 }).exec();
  
    return { expenses, totalExpenses: expenses.length };
  }

  async findUserByRangeDate(dates: ExpenseDateLastWeekDto, req?: Request){
    
    let { fecha_uno, fecha_dos } = dates;

    if (!fecha_uno || !fecha_dos) {
      const missingFields = ['fecha_uno', 'fecha_dos'].filter(field => !dates[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }
    
    fecha_uno = dayjs(fecha_uno).toDate();
    fecha_dos = dayjs(fecha_dos).toDate();
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const expenses = await this.expenseModel.find({
      date: {
        $gte: fecha_uno,
        $lte: fecha_dos,
      },
    }).where('user').equals(userFound._id).sort({ date: -1 }).exec();

    return { expenses, totalExpenses: expenses.length };
  }

}
