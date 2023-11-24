import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as DataLoader from 'dataloader';
import { Match } from 'src/matches/entities/match.entity';
import { Player } from 'src/players/entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';

@Injectable({ scope: Scope.REQUEST })
export class TeamsWithPlayersForMatchLoader extends DataLoader<number, Team[]> {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {
    super((matchIds) => this.batchLoadFn(matchIds));
  }

  private async batchLoadFn(matchIds: readonly number[]): Promise<Team[][]> {
    const matchesWithPlayers = await this.matchRepository.find({
      where: { id: In(matchIds) },
      relations: ['players'],
    });

    const playerIds = matchesWithPlayers.flatMap((match) =>
      match.players.map((player) => player.id),
    );

    const playersWithTeams = await this.playerRepository.find({
      where: { id: In(playerIds) },
      relations: ['team'],
    });

    const playerIdToTeam: Map<number, Team> = new Map();
    playersWithTeams.forEach((player) => {
      playerIdToTeam.set(player.id, player.team);
    });

    const matchIdToTeams: Map<number, Team[]> = new Map();
    matchesWithPlayers.forEach((match) => {
      const teams = match.players
        .map((player) => playerIdToTeam.get(player.id))
        .filter((team): team is Team => !!team); // out undefined values
      matchIdToTeams.set(match.id, teams);
    });

    return matchIds.map((matchId) => matchIdToTeams.get(matchId) || []);
  }
}
