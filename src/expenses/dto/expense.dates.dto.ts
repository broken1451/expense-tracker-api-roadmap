import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class ExpenseDateLastWeekDto {

    @IsDate({ message: "fecha_uno debe ser una fecha valida" })
    @Type(() => Date)
    @IsNotEmpty({ message: "fecha_uno es requerido" })
    fecha_uno: Date;

    @IsDate({ message: "fecha_dos debe ser una fecha valida" })
    @Type(() => Date)
    @IsNotEmpty({ message: "fecha_dos es requerido" })
    fecha_dos: Date;

}
