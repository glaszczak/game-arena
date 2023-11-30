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

  public decodeCursor(cursor: string, isNum = false): string | number {
    const str = Buffer.from(cursor, 'base64').toString('utf-8');

    if (isNum) {
      const num = parseInt(str, 10);

      if (isNaN(num))
        throw new BadRequestException(
          'Cursor does not reference a valid number',
        );

      return num;
    }

    return str;
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

    if (len > 0) {
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
    first: number,
    order: QueryOrderEnum,
    after?: string,
    before?: string,
    afterIsNum = false,
    beforeIsNum = false,
    innerCursor?: string,
  ): Promise<IRelayPaginated<T>> {
    const qb = repository.createQueryBuilder('entity');

    let prevCount = 0;
    let nextCount = 0;

    if (after) {
      const decoded = this.decodeCursor(after, afterIsNum);
      const filters = CommonService.getFilters(
        cursor,
        decoded,
        getQueryOrder(order),
        innerCursor,
      );
      qb.where(filters);
    }

    if (before) {
      const decoded = this.decodeCursor(before, beforeIsNum);
      const oppositeOrder = order === QueryOrderEnum.ASC ? 'DESC' : 'ASC';
      const convertedOrder = this.convertToOrderEnum(oppositeOrder, true);
      const filters = CommonService.getFilters(
        cursor,
        decoded,
        convertedOrder,
        innerCursor,
      );
      const countQb = qb.clone().where(filters);
      prevCount = await countQb.getCount();
    }

    qb.orderBy(
      `entity.${String(cursor)}`,
      order === QueryOrderEnum.ASC ? 'ASC' : 'DESC',
    ).take(first);

    const entities = await qb.getMany();

    if (after) {
      const nextQb = qb.clone();
      nextQb.skip(first);
      nextCount = await nextQb.getCount();
    }

    return {
      previousCount: prevCount,
      currentCount: entities.length,
      edges: entities.map((entity) => ({
        node: entity,
        cursor: String(entity[cursor]),
      })),
      pageInfo: {
        endCursor: entities.length
          ? String(entities[entities.length - 1][cursor])
          : null,
        startCursor: entities.length ? String(entities[0][cursor]) : null,
        hasNextPage: nextCount > 0,
        hasPreviousPage: prevCount > 0,
      },
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
