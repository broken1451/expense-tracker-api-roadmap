import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        
        console.log({data})
        const request = ctx.switchToHttp().getRequest();
        const { user } = request;

        // console.log({user})
        if (data) {
            console.log('pase por aqui', user.email)
            return user.email
        }

        console.log('pase por fuera if', user)
        return user 
    },
);