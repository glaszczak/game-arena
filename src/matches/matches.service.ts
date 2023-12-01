import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchConnection } from './entities/match.entity';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly commonService: CommonService,
  ) {}

  async matches(
    first: number,
    last: number,
    after?: number,
    before?: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC,
  ): Promise<MatchConnection> {
    try {
      return this.commonService.pagination(
        this.matchRepository,
        'id',
        first,
        last,
        order,
        after,
        before,
      );
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw new Error('Failed to fetch matches from the database');
    }
  }
}
