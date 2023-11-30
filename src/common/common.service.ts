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
import {
  IBasicPaginated,
  IEdge,
  IRelayPaginated,
} from './interfaces/paginated.interface';

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

  public basicPaginate<T>(
    instances: T[],
    totalCount: number,
    cursor: keyof T,
    first: number,
    innerCursor?: string,
  ): IBasicPaginated<T> {
    const pages: IBasicPaginated<T> = {
      totalCount,
      edges: [],
      pageInfo: {
        endCursor: '',
        hasNextPage: false,
      },
    };
    const len = instances.length;

    if (len > 0 && len <= totalCount) {
      for (let i = 0; i < len; i++) {
        pages.edges.push(
          CommonService.createEdge(instances[i], cursor, innerCursor),
        );
      }
      pages.pageInfo.endCursor = pages.edges[len - 1].cursor;
      pages.pageInfo.hasNextPage = totalCount > first;
    }

    return pages;
  }

  public relayPaginate<T>(
    instances: T[],
    currentCount: number,
    previousCount: number,
    cursor: keyof T,
    first: number,
    innerCursor?: string,
  ): IRelayPaginated<T> {
    const pages: IRelayPaginated<T> = {
      currentCount,
      previousCount,
      edges: [],
      pageInfo: {
        endCursor: '',
        startCursor: '',
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
    const len = instances.length;

    if (len > 0) {
      for (let i = 0; i < len; i++) {
        pages.edges.push(
          CommonService.createEdge(instances[i], cursor, innerCursor),
        );
      }
      pages.pageInfo.startCursor = pages.edges[0].cursor;
      pages.pageInfo.endCursor = pages.edges[len - 1].cursor;
      pages.pageInfo.hasNextPage = currentCount > first;
      pages.pageInfo.hasPreviousPage = previousCount > 0;
    }

    return pages;
  }

  private static getOrderBy<T>(
    cursor: keyof T,
    order: QueryOrderEnum,
    innerCursor?: string,
  ): Record<string, QueryOrderEnum | Record<string, QueryOrderEnum>> {
    return innerCursor
      ? {
          [cursor]: {
            [innerCursor]: order,
          },
        }
      : {
          [cursor]: order,
        };
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

  public async basicQueryBuilderPagination<T>(
    repository: Repository<T>,
    cursor: keyof T,
    first: number,
    order: QueryOrderEnum,
    after?: string,
    afterIsNum = false,
    innerCursor?: string,
  ): Promise<IBasicPaginated<T>> {
    const qb = repository.createQueryBuilder('entity');

    if (after) {
      const decoded = this.decodeCursor(after, afterIsNum);
      const qbOrder = getQueryOrder(order);
      const filters = CommonService.getFilters(
        cursor,
        decoded,
        qbOrder,
        innerCursor,
      );
      qb.where(filters);
    }

    qb.orderBy(
      `entity.${String(cursor)}`,
      order === QueryOrderEnum.ASC ? 'ASC' : 'DESC',
    ).take(first);

    const [entities, count] = await qb.getManyAndCount();

    return {
      edges: entities.map((entity) => ({
        node: entity,
        cursor: String(entity[cursor]),
      })),
      pageInfo: {
        endCursor: entities.length
          ? String(entities[entities.length - 1][cursor])
          : null,
        hasNextPage: entities.length === first,
      },
      totalCount: count,
    };
  }

  public async relayQueryBuilderPagination<T>(
    repository: Repository<T>,
    cursor: keyof T,
    first?: number,
    last?: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC,
    after?: number,
    before?: number,
    afterIsNum = true,
    beforeIsNum = true,
  ): Promise<IRelayPaginated<T>> {
    const qb = repository.createQueryBuilder('entity');

    if (after) {
      const decoded = this.decodeCursor(after, afterIsNum);
      const condition =
        order === QueryOrderEnum.ASC
          ? MoreThan(decoded)
          : MoreThanOrEqual(decoded);
      qb.andWhere({ [cursor]: condition });
    }

    if (before) {
      const decoded = this.decodeCursor(before, beforeIsNum);
      const condition =
        order === QueryOrderEnum.ASC
          ? LessThan(decoded)
          : LessThanOrEqual(decoded);
      qb.andWhere({ [cursor]: condition });
    }

    qb.orderBy(
      `entity.${String(cursor)}`,
      order === QueryOrderEnum.ASC ? 'ASC' : 'DESC',
    );

    if (first !== undefined) {
      qb.take(first + 1);
    }

    if (last) {
      qb.orderBy(
        `entity.${String(cursor)}`,
        order === QueryOrderEnum.ASC ? 'DESC' : 'ASC',
      );
      qb.take(last + 1);
    }

    const entities = await qb.getMany();

    if (first && after) {
      const decoded = this.decodeCursor(after, afterIsNum);
      const startIndex = entities.findIndex(
        (entity) => entity[cursor] === decoded,
      );
      if (startIndex >= 0) {
        entities.splice(0, startIndex + 1);
      }
    }

    if (last) {
      entities.reverse();
    }

    let hasNextPage = false;
    let hasPreviousPage = false;

    if (first !== undefined && entities.length > first) {
      hasNextPage = true;
      entities.pop();
    }

    if (last !== undefined && entities.length > last) {
      hasPreviousPage = true;
      entities.shift();
    }

    return {
      edges: entities.map((entity) => ({
        node: entity,
        cursor: String(entity[cursor]),
      })),
      pageInfo: {
        endCursor: entities.length
          ? String(entities[entities.length - 1][cursor])
          : null,
        startCursor: entities.length ? String(entities[0][cursor]) : null,
        hasNextPage,
        hasPreviousPage,
      },
      previousCount: hasPreviousPage ? 1 : 0,
      currentCount: entities.length,
    };
  }

  private convertToOrderEnum(
    order: 'ASC' | 'DESC',
    isOpposite = false,
  ): tOrderEnum | tOppositeOrder {
    if (isOpposite) {
      return order === 'ASC' ? '$lte' : '$gte';
    } else {
      return order === 'ASC' ? '$gt' : '$lt';
    }
  }
}
