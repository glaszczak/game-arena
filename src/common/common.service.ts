import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  QueryOrderEnum,
  getQueryOrder,
  tOppositeOrder,
  tOrderEnum,
} from './enums/query-order.enum';
import { IEdge, IPaginated } from './interfaces/paginated.interface';

@Injectable()
export class CommonService {
  private static encodeCursor(val: Date | string | number): string {
    let str: string;

    if (val instanceof Date) {
      str = val.getTime().toString();
    } else if (typeof val === 'number' || typeof val === 'bigint') {
      str = val.toString();
    } else {
      str = val;
    }

    return Buffer.from(str, 'utf-8').toString('base64');
  }

  public decodeCursor(cursor: string | number, isNum = true): string | number {
    if (isNum) {
      if (typeof cursor === 'number') {
        return cursor;
      } else {
        throw new BadRequestException(
          'Expected numeric cursor, but got a non-numeric value',
        );
      }
    } else {
      if (typeof cursor === 'string') {
        // Validate base64 string
        if (
          !/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
            cursor,
          )
        ) {
          throw new BadRequestException('Cursor is not a valid base64 string');
        }
        return Buffer.from(cursor, 'base64').toString('utf-8');
      } else {
        throw new BadRequestException(
          'Expected string cursor, but got a non-string value',
        );
      }
    }
  }

  private static createEdge<T>(
    instance: T,
    cursor: keyof T,
    innerCursor?: string,
  ): IEdge<T> {
    try {
      return {
        node: instance,
        cursor: CommonService.encodeCursor(
          innerCursor ? instance[cursor][innerCursor] : instance[cursor],
        ),
      };
    } catch (_) {
      throw new InternalServerErrorException('The given cursor is invalid');
    }
  }

  private static getFilters<T>(
    cursor: keyof T,
    decoded: string | number,
    order: tOrderEnum | tOppositeOrder,
    innerCursor?: string,
  ): Record<string, any> {
    let condition;
    switch (order) {
      case '$gt':
        condition = MoreThan(decoded);
        break;
      case '$lt':
        condition = LessThan(decoded);
        break;
      case '$gte':
        condition = MoreThanOrEqual(decoded);
        break;
      case '$lte':
        condition = LessThanOrEqual(decoded);
        break;
    }

    if (innerCursor) {
      return { [cursor]: { [innerCursor]: condition } };
    } else {
      return { [cursor]: condition };
    }
  }

  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async checkNextPageExistence<T>(
    repository: Repository<T>,
    cursor: keyof T,
    lastCursor: string,
    order: QueryOrderEnum,
  ): Promise<boolean> {
    const decodedLastCursor = this.decodeCursor(
      lastCursor,
      typeof lastCursor === 'number',
    );
    const condition = CommonService.getFilters(
      cursor,
      decodedLastCursor,
      getQueryOrder(order),
    );

    const count = await repository.count({ where: condition });
    return count > 0;
  }

  public async pagination<T>(
    repository: Repository<T>,
    cursor: keyof T,
    first?: number,
    last?: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC,
    after?: number,
    before?: number,
    afterIsNum = true,
    beforeIsNum = true,
  ): Promise<IPaginated<T>> {
    const qb = repository.createQueryBuilder('entity');

    const decoded = this.decodeCursor(
      after ?? before,
      afterIsNum ?? beforeIsNum,
    );
    qb.andWhere({ [cursor]: after ? MoreThan(decoded) : LessThan(decoded) });

    let entities: T[];

    if (first !== undefined) {
      qb.orderBy(
        `entity.${String(cursor)}`,
        order === QueryOrderEnum.ASC ? 'ASC' : 'DESC',
      );
      qb.limit(first);
      entities = await this.throwInternalError(qb.getMany());
    } else if (last !== undefined) {
      const reverseOrder = order === QueryOrderEnum.ASC ? 'DESC' : 'ASC';
      qb.orderBy(`entity.${String(cursor)}`, reverseOrder);
      qb.limit(last);
      const reversedEntities = await this.throwInternalError(qb.getMany());
      entities = reversedEntities.reverse();
    } else {
      qb.orderBy(
        `entity.${String(cursor)}`,
        order === QueryOrderEnum.ASC ? 'ASC' : 'DESC',
      );
      entities = await this.throwInternalError(qb.getMany());
    }

    const edges = entities.map((entity) =>
      CommonService.createEdge(entity, cursor),
    );

    let hasNextPage = false;
    let hasPreviousPage = false;

    if (edges.length > 0) {
      hasNextPage = await this.checkNextPageExistence(
        repository,
        cursor,
        edges[edges.length - 1].cursor,
        order,
      );
      hasPreviousPage = after != null;
    }

    return {
      edges,
      pageInfo: {
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage,
        hasPreviousPage,
      },
      previousCount: hasPreviousPage ? 1 : 0,
      currentCount: edges.length,
    };
  }
}
