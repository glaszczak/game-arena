import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  players() {
    return this.playerRepository.find();
  }

  async playerTeam(playerId: number): Promise<Team> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: ['team'],
    });

    return player ? player.team : null;
  }

  playerMatchesWithTeam(playerId: number) {
    return `This action returns a #${playerId} matches with team`;
  }
}
