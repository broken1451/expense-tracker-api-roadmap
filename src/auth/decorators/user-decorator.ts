import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {


        const request = ctx.switchToHttp().getRequest();
        const { user } = request;
        console.log({ data })

        console.log(user)
        if (data) {
            return user.email
        }
        return user
    },
);