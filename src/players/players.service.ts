import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, PlayerConnection } from './entities/player.entity';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly commonService: CommonService,
  ) {}

  async players(
    first: number,
    last: number,
    after?: number,
    before?: number,
    order: QueryOrderEnum = QueryOrderEnum.ASC,
  ): Promise<PlayerConnection> {
    try {
      return this.commonService.pagination(
        this.playerRepository,
        'id',
        first,
        last,
        order,
        after,
        before,
      );
    } catch (error) {
      console.error('Error fetching players:', error);
      throw new Error('Failed to fetch players from the database');
    }
  }
}
