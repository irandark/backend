export class FilterProductsDto {
  categoryId: number;
  subcategoryIds: number[];
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
