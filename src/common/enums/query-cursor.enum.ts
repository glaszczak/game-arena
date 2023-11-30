import { registerEnumType } from '@nestjs/graphql';
import { IBase } from '../interfaces/paginated.interface';

export enum QueryCursorEnum {
  DATE = 'DATE',
  ALPHA = 'ALPHA',
}

registerEnumType(QueryCursorEnum, {
  name: 'QueryCursor',
});

export const getQueryCursor = (cursor: QueryCursorEnum): keyof IBase =>
  cursor === QueryCursorEnum.ALPHA ? 'id' : 'slug';
