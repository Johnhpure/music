import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';
import { AdminLog } from './entities/admin-log.entity';
import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AdminLog])],
  providers: [EncryptionService, AuditService, RolesGuard, AdminGuard],
  exports: [EncryptionService, AuditService, RolesGuard, AdminGuard],
})
export class CommonModule {}
