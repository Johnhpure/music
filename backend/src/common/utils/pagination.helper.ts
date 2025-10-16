import {
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';

/**
 * 分页选项接口
 */
export interface PaginationOptions<T> {
  page?: number;
  limit?: number;
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindOptionsOrder<T>;
  relations?: string[];
  select?: (keyof T)[];
}

/**
 * 分页结果接口
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 通用分页查询辅助函数
 * 消除重复的分页逻辑代码
 *
 * @param repository TypeORM Repository实例
 * @param options 分页选项
 * @returns 分页结果
 *
 * @example
 * ```typescript
 * const result = await paginate(userRepository, {
 *   page: 1,
 *   limit: 10,
 *   where: { is_active: true },
 *   order: { created_at: 'DESC' }
 * });
 * ```
 */
export async function paginate<T>(
  repository: Repository<T>,
  options: PaginationOptions<T> = {},
): Promise<PaginationResult<T>> {
  const { page = 1, limit = 10, where, order, relations, select } = options;

  // 参数验证
  const currentPage = Math.max(1, page);
  const pageSize = Math.min(Math.max(1, limit), 100); // 限制最大100条/页
  const skip = (currentPage - 1) * pageSize;

  // 构建查询选项
  const findOptions: FindManyOptions<T> = {
    where,
    order,
    skip,
    take: pageSize,
  };

  if (relations && relations.length > 0) {
    findOptions.relations = relations;
  }

  if (select && select.length > 0) {
    findOptions.select = select;
  }

  // 执行查询
  const [data, total] = await repository.findAndCount(findOptions);

  // 计算分页信息
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return {
    data,
    total,
    page: currentPage,
    pageSize,
    totalPages,
    hasNext,
    hasPrevious,
  };
}

/**
 * 分页DTO基类
 * 其他模块的分页DTO可以继承此类
 */
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}
