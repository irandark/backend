import { Column } from 'typeorm';

export function nullableNumberColumn(): PropertyDecorator {
  return Column({ type: 'int', nullable: true });
}
