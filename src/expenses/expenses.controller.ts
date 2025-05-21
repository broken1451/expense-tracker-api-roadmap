import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Req } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {Auth} from '../auth/entities/auth.entity'
import { ValidRoles } from 'src/auth/interface/role.interfaces';
import { GetUser } from 'src/auth/decorators/user-decorator';
import { Auth as A } from '../auth/decorators/auth.decorator';
import { ExpenseDateLastWeekDto } from './dto/expense.dates.dto';

@Controller('expenses')
export class ExpensesController {
  
  constructor(private readonly expensesService: ExpensesService) {}

  // @Post()
  // @A()
  // create(@GetUser('email') userEmail: string, @Body() createExpenseDto: CreateExpenseDto) {
  //   // console.log('data create', user);
  //   return this.expensesService.create(createExpenseDto);
  // }

  @Post()
  @A()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @A()
  findAll(@Query('page') page: string, @Req() req: Request) {
    return this.expensesService.findAll(page, req);
  }

  @Get('/:id')
  @A()
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.expensesService.findOne(id, req);
  }

  @Patch('/:id')
  @A()
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Req() req: Request) {
    return this.expensesService.update(id, updateExpenseDto, req);
  }
  
  @Delete('/:id')
  @A()
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.expensesService.remove(id, req);
  }

  @Get('/findexpenses/:term')
  findUserByTerm(@Param('term') term: string, @Query('desde') desde: string) {
    return this.expensesService.findUserByTerm(term, desde);
  }

  @Get('/last/find-by-last-week')
  @A()
  findExpenseByLastWeek(@Req() req: Request) {
    return this.expensesService.findUserByLastWeek(req);
  }

  @Get('/find/by-last-month')
  @A()
  findExpenseByLastMonth(@Req() req: Request) {
    return this.expensesService.findUserByLasMoth(req);
  }

  @Get('/find/by-last-3month')
  @A()
  findExpenseByLast3Month(@Req() req: Request) {
    return this.expensesService.findUserByLas3Months(req);
  }

  @Get('/find/by-range-date')
  @A()
  findExpenseByRangeDate(@Query() dates: ExpenseDateLastWeekDto, @Req() req: Request) {
    return this.expensesService.findUserByRangeDate(dates, req);
  }
}
