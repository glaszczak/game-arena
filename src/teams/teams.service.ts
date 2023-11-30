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
    return this.commonService.relayQueryBuilderPagination(
      this.teamRepository,
      'id',
      first,
      last,
      order,
      after,
      before,
    );
  }
}
