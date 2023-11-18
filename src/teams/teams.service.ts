import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { Player } from 'src/players/entities/player.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  teams() {
    return this.teamRepository.find();
  }

  async teamPlayers(teamId: number): Promise<Player[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['players', 'players.team'],
    });

    return team ? team.players : [];
  }
}
