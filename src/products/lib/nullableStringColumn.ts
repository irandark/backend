import { Column } from 'typeorm';

export function nullableStringColumn(): PropertyDecorator {
  return Column({ type: 'varchar', nullable: true });
}
