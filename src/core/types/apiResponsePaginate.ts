export interface ApiResponsePaginate {
  code: number;
  message: string;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  data: any;
}
