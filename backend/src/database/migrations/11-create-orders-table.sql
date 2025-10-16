-- 创建订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `package_id` INT NULL COMMENT '套餐ID',
  `points` INT NOT NULL COMMENT '点数数量',
  `bonus` INT NOT NULL DEFAULT 0 COMMENT '赠送点数',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `payment_method` VARCHAR(20) NOT NULL DEFAULT 'wechat' COMMENT '支付方式',
  `transaction_id` VARCHAR(128) NULL COMMENT '支付交易号',
  `payment_data` TEXT NULL COMMENT '支付数据',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `paid_at` TIMESTAMP NULL COMMENT '支付时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
