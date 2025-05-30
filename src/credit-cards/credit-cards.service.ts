import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreditCard } from './entities/credit-card.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import * as dayjs from 'dayjs';
import 'dayjs/locale/es'; // Si quieres trabajar con la configuración regional en español
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { console } from 'inspector';
import { TransactionDto } from './dto/transaction.dto';
import { AuthService } from 'src/auth/auth.service';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
dayjs.tz.setDefault('America/Santiago');

@Injectable()
export class CreditCardsService {


  constructor(
    @InjectModel(CreditCard.name) private readonly tdcModel: Model<CreditCard>,
    private readonly authService: AuthService,
  ) { }


  async create(createCreditCardDto: CreateCreditCardDto) {

    let { name, creditLimit, annualInterestRate, dueDate, grantDate, ...rest } = createCreditCardDto;

    if (!name || !creditLimit || !dueDate || !grantDate) {
      const missingFields = ['name', 'creditLimit', 'closingDate', 'paymentDate'].filter(field => !createCreditCardDto[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`The following fields are required: ${missingFields.join(', ')}`);
      }
    }

    name = name.toLowerCase().trim();
    creditLimit = Number(creditLimit.toString().trim());
    if (annualInterestRate) {
      annualInterestRate = Number(annualInterestRate.toString().trim());
    }
    dueDate = dayjs(dueDate).toDate();
    grantDate = dayjs(grantDate).toDate();

    try {
      const creditCardCreated: CreditCard = await this.tdcModel.create({
        name,
        creditLimit,
        annualInterestRate,
        dueDate,
        grantDate,
        ...rest
      });
      return creditCardCreated
    } catch (error) {
      console.error('Error creating credit card:', error);
      throw new BadRequestException(`Error creating credit card: ${error.message}`);
    }

  }

  async findAll(req: Request) {
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const creditCards = (await this.tdcModel.find({}, '-__v').where('user').equals(userFound._id)).filter(
      (creditCard) => creditCard.isActive === true
    );
    const countsTotalcreditCards = await this.tdcModel.countDocuments({});
    return {
      creditCards,
      totalCreditCards: creditCards.length,
      countsTotalcreditCards
    };
  }

 async findOne(id: string, req?: Request) {
    
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`The expense with id ${id} does not valid mongo id`);
    }

    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);   

    const creditCardFound = await this.tdcModel.findById(id).where('user').equals(userFound.id).exec();
    if (!creditCardFound) {
      throw new BadRequestException(`The credit card with id ${id} does not exist`);
    }

    return creditCardFound;
  }



  async updateTransaction(nameCreditCard: string, transactionDto: TransactionDto, req?: Request) {

    const logger = new Logger('bootstrap');
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const creditFound = await this.tdcModel.findOne({ name: nameCreditCard.toLowerCase().trim() }).where('user').equals(userFound._id);
    if (!creditFound) {
      throw new BadRequestException(`The credit card with the name ${nameCreditCard} does not exist`);
    }

    let { _id, ...rest } = transactionDto;
    if (_id) {
      const transactionToUpdate = creditFound.transaction.find(
        (trans) => trans._id.toString() === _id,
      );
      if (transactionToUpdate) {

        const updateResult = await this.tdcModel.updateOne(
          { name: nameCreditCard.toLowerCase().trim(), 'transaction._id': _id }, // Usamos _id del DTO aquí
          { $set: { 'transaction.$': { ...transactionToUpdate.toObject(), ...rest } } },
          { new: true } 
        ).where('user').equals(userFound._id);;

        if (updateResult.modifiedCount > 0) {
          return this.tdcModel.findOne({
            name: nameCreditCard.toLowerCase().trim()
          }).where('user').equals(userFound._id);;
        } else {
          logger.warn(
            `No se realizaron cambios en la transacción con id ${_id} en la tarjeta ${nameCreditCard.toLowerCase().trim()}`,
          );
          return this.tdcModel.findOne({
            name: nameCreditCard.toLowerCase().trim()
          });
        }
      } else {
        // Si se proporciona un _id pero no se encuentra, la agregamos como nueva
        await this.tdcModel.updateOne(
          { name: nameCreditCard.toLowerCase().trim() },
          { $push: { transaction: { tarjeta: nameCreditCard.toLowerCase().trim(), ...rest } } },
        ).where('user').equals(userFound._id);;
        return this.tdcModel.findOne({
          name: nameCreditCard.toLowerCase().trim()
        }).where('user').equals(userFound._id);;
      }
    } else {
      // Agregar una nueva transacción (no se proporcionó _id)
      await this.tdcModel.updateOne(
        { name: nameCreditCard.toLowerCase().trim() },
        { $push: { transaction: { tarjeta: nameCreditCard.toLowerCase().trim(), ...rest } } },
      ).where('user').equals(userFound._id);;
      return this.tdcModel.findOne({
        name: nameCreditCard.toLowerCase().trim()
      }).where('user').equals(userFound._id);;
    }
  }

  async removeTransaction(nameCreditCard: string, transactionId: string, req?: Request) {
    
    const logger = new Logger('bootstrap');
    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
    const creditFound = await this.tdcModel.findOne({ name: nameCreditCard.toLowerCase().trim() }).where('user').equals(userFound._id);;
    if (!creditFound) {
      throw new BadRequestException(`The credit card with the name ${nameCreditCard} does not exist`);
    }
    
    logger.log(creditFound);
    const transactionToDelete = creditFound.transaction.find((tran)=> tran._id.toString() === transactionId);
    logger.log(transactionToDelete);
    if (!transactionToDelete) {
      throw new BadRequestException(`The transaction with the id ${transactionId} does not exist`);
    }

    if (transactionToDelete) {
      const updateResult = await this.tdcModel.updateOne(
        { name: nameCreditCard.toLowerCase().trim() },
        { $pull: { transaction: { _id: transactionId } } },
      ).where('user').equals(userFound._id);;

      if (updateResult.modifiedCount > 0) {
        return this.tdcModel.findOne({
          name: nameCreditCard.toLowerCase().trim()
        }).where('user').equals(userFound._id);;
      } 
    } else {
      logger.warn(
        `No se encontraron transacciones con el id ${transactionId} en la tarjeta ${nameCreditCard.toLowerCase().trim()}`,
      );
      return this.tdcModel.findOne({
        name: nameCreditCard.toLowerCase().trim()
      }).where('user').equals(userFound._id);;
    }
    
    
  }


  async update(id: string, updateCreditCardDto: UpdateCreditCardDto, req?: Request) {

    const creditFound = await this.findOne(id)
    if (!creditFound) {
      throw new BadRequestException(`The expense with the id ${id} does not exist`);
    }

    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);

    let { name, creditLimit, annualInterestRate, dueDate, grantDate } = updateCreditCardDto;

    const creditUpdated = await this.tdcModel.findByIdAndUpdate(id, {
      name: name ? name.toLowerCase().trim() : creditFound.name,
      creditLimit: creditLimit ? Number(creditLimit.toString().trim()) : creditFound.creditLimit,
      annualInterestRate: annualInterestRate ? Number(annualInterestRate.toString().trim()) : creditFound.annualInterestRate,
      dueDate: dueDate ? dayjs(dueDate).toDate() : creditFound.dueDate,
      grantDate: grantDate ? dayjs(grantDate).toDate() : creditFound.grantDate,
      update_at: Date.now()
    }, { new: true }).where('user').equals(userFound._id).exec();

    return creditUpdated;
  }

  async remove(id: string,  req?: Request) {

    const credidCardExist= await this.findOne(id);
    if (!credidCardExist) {
      throw new BadRequestException(`El usuario con el id ${id} no existe`);
    }

    if (!credidCardExist.isActive) {
      throw new BadRequestException(`El usuario con el id ${id} ya esta eliminado`);
    }

    const userId = req['user']._id;
    const userFound = await this.authService.findOne(userId);
  
    credidCardExist.isActive = false;
    credidCardExist.update_at = Date.now();
    const credidCardDeleted = await this.tdcModel.findByIdAndUpdate(id, credidCardExist, {
      new: true,
    }).where('user').equals(userFound._id).exec();

    return credidCardDeleted;
  }
}
