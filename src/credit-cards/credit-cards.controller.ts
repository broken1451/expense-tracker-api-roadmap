import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
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
  findAll(@Req() req: Request) {
    return this.creditCardsService.findAll(req);
  }

  @Get('/:id')
  @A()
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.creditCardsService.findOne(id, req);
  }

  @Patch('/:id')
  @A()
  update(@Param('id') id: string, @Body() updateCreditCardDto: UpdateCreditCardDto, @Req() req: Request) {
    return this.creditCardsService.update(id, updateCreditCardDto, req);
  }

  @Delete('/:id')
  @A()
  remove(@Param('id') id: string,@Req() req: Request) {
    return this.creditCardsService.remove(id, req);
  }

  @Patch('/update/transaction/:nameCreditCard')
  @A()
  updateTransaction(@Param('nameCreditCard') nameCreditCard: string, @Body() transactionDto: TransactionDto, @Req() req: Request) {
    return this.creditCardsService.updateTransaction(nameCreditCard, transactionDto, req);
  }

  @Delete('/delete/transaction/:nameCreditCard/:transactionId')
  @A()
  removeTransaction(@Param('nameCreditCard') nameCreditCard: string, @Param('transactionId') transactionId: string, @Req() req: Request) {
    return this.creditCardsService.removeTransaction(nameCreditCard, transactionId);
  }
}
