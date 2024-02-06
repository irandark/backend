export class CreateProductDto {
  article: string;
  name: string;
  price: number;
  subcategoryIds: number[];
  categoryId: number;
}
