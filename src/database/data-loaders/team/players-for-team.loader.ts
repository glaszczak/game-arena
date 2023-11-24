import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as DataLoader from 'dataloader';
import { Player } from 'src/players/entities/player.entity';

@Injectable({ scope: Scope.REQUEST })
export class PlayersForTeamLoader extends DataLoader<number, Player[]> {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
    super((teamIds) => this.batchLoadFn(teamIds));
  }

  private async batchLoadFn(teamIds: readonly number[]): Promise<Player[][]> {
    const players = await this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.team', 'team')
      .where('team.id IN (:...teamIds)', { teamIds })
      .getMany();

    const teamIdToPlayers: { [teamId: number]: Player[] } = {};
    players.forEach((player) => {
      if (player.team && teamIds.includes(player.team.id)) {
        if (!teamIdToPlayers[player.team.id]) {
          teamIdToPlayers[player.team.id] = [];
        }
        teamIdToPlayers[player.team.id].push(player);
      }
    });

    return teamIds.map((teamId) => teamIdToPlayers[teamId] || []);
  }
}
