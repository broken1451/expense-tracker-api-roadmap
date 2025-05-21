import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { TransactionDto } from './dto/transaction.dto';
import { Auth as A } from '../auth/decorators/auth.decorator';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(@Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardsService.create(createCreditCardDto);
  }

  @Get()
  @A()
  findAll() {
    return this.creditCardsService.findAll();
  }

  @Get('/:id')
  @A()
  findOne(@Param('id') id: string) {
    return this.creditCardsService.findOne(id);
  }

  @Patch('/:id')
  @A()
  update(@Param('id') id: string, @Body() updateCreditCardDto: UpdateCreditCardDto) {
    return this.creditCardsService.update(id, updateCreditCardDto);
  }

  @Delete('/:id')
  @A()
  remove(@Param('id') id: string) {
    return this.creditCardsService.remove(id);
  }

  @Patch('/update/transaction/:nameCreditCard')
  @A()
  updateTransaction(@Param('nameCreditCard') nameCreditCard: string, @Body() transactionDto: TransactionDto) {
    return this.creditCardsService.updateTransaction(nameCreditCard, transactionDto);
  }

  @Delete('/delete/transaction/:nameCreditCard/:transactionId')
  @A()
  removeTransaction(@Param('nameCreditCard') nameCreditCard: string, @Param('transactionId') transactionId: string) {
    return this.creditCardsService.removeTransaction(nameCreditCard, transactionId);
  }
}
