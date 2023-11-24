import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';
import { MatchesForPlayerLoader } from 'src/database/data-loaders/player/matches-for-player.loader';
import { TeamForPlayerLoader } from 'src/database/data-loaders/player/team-for-player.loader';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(
    private readonly playersService: PlayersService,
    private readonly matchesForPlayerLoader: MatchesForPlayerLoader,
    private readonly teamForPlayerLoader: TeamForPlayerLoader,
  ) {}

  @Query(() => [Player], { name: 'players' })
  async players(): Promise<Player[]> {
    return this.playersService.players();
  }

  @Query(() => Team, { name: 'teamPerPlayer' })
  async playerTeam(
    @Args('playerId', { type: () => Int }) playerId: number,
  ): Promise<Team> {
    return this.teamForPlayerLoader.load(playerId);
  }

  @Query(() => [Match], { name: 'matchesPerPlayer' })
  async playerMatches(
    @Args('playerId', { type: () => Int }) playerId: number,
  ): Promise<Match[]> {
    return this.matchesForPlayerLoader.load(playerId);
  }

  @ResolveField('team')
  async team(@Parent() player: Player): Promise<Team> {
    return this.teamForPlayerLoader.load(player.id);
  }

  @ResolveField('matches')
  async matches(@Parent() player: Player): Promise<Match[]> {
    return this.matchesForPlayerLoader.load(player.id);
  }
}
