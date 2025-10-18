import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  // 获取用户统计数据
  @Get('stats')
  async getStats() {
    const stats = await this.userService.getAdminStats();
    return {
      success: true,
      data: stats,
    };
  }

  // 高级筛选查询用户列表
  @Get()
  async findAllWithFilters(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive' | 'banned' | 'pending',
    @Query('userType') userType?: 'free' | 'vip' | 'admin',
    @Query('registrationSource')
    registrationSource?: 'wechat' | 'web' | 'mobile' | 'unknown',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const result = await this.userService.findAllWithFilters({
      page,
      limit,
      search,
      status,
      userType,
      registrationSource,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      ...result,
    };
  }

  // 获取指定用户详情
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  // 更新指定用户
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      message: '用户信息更新成功',
      data: updatedUser,
    };
  }

  // 删除指定用户
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return {
      success: true,
      message: '用户删除成功',
    };
  }

  // 切换用户封禁状态
  @Post(':id/toggle-ban')
  async toggleBan(@Param('id', ParseIntPipe) id: number) {
    const updatedUser = await this.userService.toggleBan(id);
    return {
      success: true,
      message: `用户已${updatedUser.is_banned ? '封禁' : '解封'}`,
      data: updatedUser,
    };
  }

  // 调整用户积分
  @Post(':id/adjust-credit')
  async adjustCredit(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount', ParseIntPipe) amount: number,
    @Body('reason') reason?: string,
  ) {
    const updatedUser = await this.userService.adjustCredit(id, amount, reason);
    return {
      success: true,
      message: '积分调整成功',
      data: {
        userId: updatedUser.id,
        newCredit: updatedUser.credit,
        adjustment: amount,
      },
    };
  }

  // 批量封禁用户
  @Post('batch/ban')
  async batchBan(@Body('userIds') userIds: number[]) {
    const result = await this.userService.batchBan(userIds);
    return {
      success: true,
      message: `批量封禁完成: ${result.success} 成功, ${result.failed} 失败`,
      data: result,
    };
  }

  // 批量激活用户
  @Post('batch/activate')
  async batchActivate(@Body('userIds') userIds: number[]) {
    const result = await this.userService.batchActivate(userIds);
    return {
      success: true,
      message: `批量激活完成: ${result.success} 成功, ${result.failed} 失败`,
      data: result,
    };
  }

  // 批量删除用户
  @Post('batch/delete')
  async batchDelete(@Body('userIds') userIds: number[]) {
    const result = await this.userService.batchDelete(userIds);
    return {
      success: true,
      message: `批量删除完成: ${result.success} 成功, ${result.failed} 失败`,
      data: result,
    };
  }
}
