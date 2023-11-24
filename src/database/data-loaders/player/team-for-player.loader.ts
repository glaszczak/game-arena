import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as DataLoader from 'dataloader';
import { Player } from 'src/players/entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';

@Injectable({ scope: Scope.REQUEST })
export class TeamForPlayerLoader extends DataLoader<number, Team | null> {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
    super((playerIds) => this.batchLoadFn(playerIds));
  }

  private async batchLoadFn(
    playerIds: readonly number[],
  ): Promise<(Team | null)[]> {
    const players = await this.playerRepository.find({
      where: { id: In(playerIds as number[]) },
      relations: ['team'],
    });

    const playerIdToTeam: Map<number, Team | null> = new Map();
    players.forEach((player) => {
      playerIdToTeam.set(player.id, player.team || null);
    });

    return playerIds.map((playerId) => playerIdToTeam.get(playerId));
  }
}
