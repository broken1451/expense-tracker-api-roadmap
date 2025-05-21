import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { Observable } from 'rxjs';

import { Auth } from '../entities/auth.entity';
import { META_ROLES } from '../decorators/decorators.decorator';
  
  @Injectable()
  export class GuardAuth implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      let validRoles: string[] = this.reflector.get(
        META_ROLES,
        context.getHandler(),
      );
  
      if (!validRoles) return true;
      if (validRoles.length == 0) return true;
      // console.log({validRoles});
  
      const req = context.switchToHttp().getRequest();
      // console.log({req});
      const user = req.user as Auth;
      // console.log ({user});
      if (!user) {
        throw new BadRequestException('User not found');
      }
  
      for (const role of user.roles) {
        if (validRoles.includes(role)) {
          return true;
        }
      }
  
      throw new ForbiddenException(`User  ${user.name} needs a valid role: [${validRoles}]`)
    }
  }