import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/admin.guard';
import { UnauthorizedExceptionFilter } from '../unauthorized-exception/unauthorized-exception.filter';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('show/adultVerifyRequest')
  @UseFilters(UnauthorizedExceptionFilter)
  @Render('admin')
  async getAllAdultVerifyRequest() {
    return await this.adminService.getAllAdultVerifyRequest();
  }

  @Post('accept/:id')
  async acceptAdultVerifyRequest(@Param('id') id: number) {
    return await this.adminService.acceptAdultVerifyRequest(id);
  }
}
