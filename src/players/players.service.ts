import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  players() {
    return this.playerRepository.find();
  }

  playerTeam(playerId: number) {
    return `This action returns a #${playerId} team`;
  }

  playerMatchesWithTeam(playerId: number) {
    return `This action returns a #${playerId} matches with team`;
  }
}
