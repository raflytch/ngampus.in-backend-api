export class PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
