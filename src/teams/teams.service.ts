import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamConnection } from './entities/team.entity';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly commonService: CommonService,
  ) {}

  async teams(
    first: number,
    last: number,
    after?: number,
    before?: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC,
  ): Promise<TeamConnection> {
    try {
      return this.commonService.pagination(
        this.teamRepository,
        'id',
        first,
        last,
        order,
        after,
        before,
      );
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams from the database');
    }
  }
}
