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
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 获取当前用户信息
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      credit: user.credit,
      role: user.role,
      is_active: user.is_active,
      is_admin: user.is_admin,
      is_banned: user.is_banned,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  // 更新当前用户信息
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(
      req.user.id,
      updateUserDto,
    );
    const { password, ...userProfile } = updatedUser as any;
    return {
      message: '用户信息更新成功',
      data: userProfile,
    };
  }

  // 获取用户统计信息
  @Get('stats')
  async getStats(@Request() req) {
    return this.userService.getUserStats(req.user.id);
  }

  // 每日签到
  @Post('checkin')
  async checkin(@Request() req) {
    return this.userService.checkin(req.user.id);
  }

  // 获取签到历史
  @Get('checkin/history')
  async getCheckinHistory(@Request() req) {
    return this.userService.getCheckinHistory(req.user.id);
  }

  // 管理员接口：获取所有用户
  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.userService.findAll(page, limit);
  }

  // 管理员接口：获取指定用户
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // 管理员接口：更新指定用户
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // 管理员接口：删除指定用户
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return { message: '用户删除成功' };
  }
}
