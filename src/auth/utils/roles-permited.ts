import { BadRequestException } from '@nestjs/common';

let rolesNotRepeated: string[] = [];

export const rolesPermited = (rolesReq: string[], rolesPermited: string[]): string[] => {
  
  rolesNotRepeated = rolesReq;

  rolesNotRepeated = rolesReq?.filter((item, index) => {
    return rolesReq?.indexOf(item) === index;
  });

  for (const rol of rolesNotRepeated) {
    if (!rolesPermited?.includes(rol)) {
      throw new BadRequestException(
        `El rol ingresado ${rol} no es permitido, roles permitidos [${rolesPermited}]`,
      );
    }
  }
  return rolesNotRepeated
};