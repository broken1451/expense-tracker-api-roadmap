import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ValidRoles } from '../interface/role.interfaces';
import { GuardAuth } from '../guards/auth.guard';
import { Roles } from './decorators.decorator';


export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        Roles(...roles),
        UseGuards(AuthGuard('jwt'), GuardAuth)
    );
}