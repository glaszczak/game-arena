import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as DataLoader from 'dataloader';
import { Match } from 'src/matches/entities/match.entity';

@Injectable({ scope: Scope.REQUEST })
export class MatchesForPlayerLoader extends DataLoader<number, Match[]> {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {
    super((playerIds) => this.batchLoadFn(playerIds));
  }

  private async batchLoadFn(playerIds: readonly number[]): Promise<Match[][]> {
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.players', 'player')
      .where('player.id IN (:...playerIds)', { playerIds })
      .getMany();

    const playerIdToMatches: { [playerId: number]: Match[] } = {};
    matches.forEach((match) => {
      match.players.forEach((player) => {
        if (!playerIdToMatches[player.id]) {
          playerIdToMatches[player.id] = [];
        }
        playerIdToMatches[player.id].push(match);
      });
    });

    return playerIds.map((playerId) => playerIdToMatches[playerId] || []);
  }
}
