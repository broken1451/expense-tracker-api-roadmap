import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginhDto, LoginhDtoGoogle } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interface/role.interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  // @Auth()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginhDto) {
    return this.authService.login(loginDto);
  }

  @Post('/login/google')
  loginGoogle(@Body() req: LoginhDtoGoogle  ){
    return this.authService.loginGoogle(req);
  }

  @Get()
  @Auth(ValidRoles.admin)
  findAll(@Query('page') page: string) {
    return this.authService.findAll(page);
  }

  @Get('/:id')
  @Auth(ValidRoles.admin)
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Patch('/:id')
  @Auth(ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  // habilitar despues
  @Post('/recover-password')
  @HttpCode(200)
  updatePassword(@Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updatePassword(updateAuthDto);
  }

  @Delete('/:id')
  @Auth(ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Get('/total/sizedb')
  @Auth(ValidRoles.admin, ValidRoles.user)
  sizeDB() {
    return this.authService.sizeDB();
  }
}
