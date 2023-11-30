import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player, PlayerConnection } from './entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';
import { MatchesForPlayerLoader } from 'src/database/data-loaders/player/matches-for-player.loader';
import { TeamForPlayerLoader } from 'src/database/data-loaders/player/team-for-player.loader';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(
    private readonly playersService: PlayersService,
    private readonly matchesForPlayerLoader: MatchesForPlayerLoader,
    private readonly teamForPlayerLoader: TeamForPlayerLoader,
  ) {}

  @Query(() => PlayerConnection, { name: 'players' })
  async players(
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('after', { type: () => Int, nullable: true }) after?: number,
    @Args('before', { type: () => Int, nullable: true }) before?: number,
    @Args('order', {
      type: () => QueryOrderEnum,
      nullable: true,
    })
    order?: QueryOrderEnum,
  ): Promise<PlayerConnection> {
    try {
      return await this.playersService.players(
        first,
        last,
        after,
        before,
        order,
      );
    } catch (error) {
      console.error('Error in players query:', error);

      throw new Error('Error occurred while retrieving players');
    }
  }

  @Query(() => Team, { name: 'teamPerPlayer' })
  async playerTeam(
    @Args('playerId', { type: () => Int }) playerId: number,
  ): Promise<Team> {
    try {
      return await this.teamForPlayerLoader.load(playerId);
    } catch (error) {
      throw new Error('Error occurred while retrieving the player’s team');
    }
  }

  @Query(() => [Match], { name: 'matchesPerPlayer' })
  async playerMatches(
    @Args('playerId', { type: () => Int }) playerId: number,
  ): Promise<Match[]> {
    try {
      return await this.matchesForPlayerLoader.load(playerId);
    } catch (error) {
      console.error(
        `Error fetching matches for player with ID ${playerId}:`,
        error,
      );

      throw new Error(
        `Error occurred while retrieving matches for the player with ID ${playerId}`,
      );
    }
  }

  @ResolveField('team')
  async team(@Parent() player: Player): Promise<Team> {
    try {
      return await this.teamForPlayerLoader.load(player.id);
    } catch (error) {
      console.error(
        `Error fetching team for player with ID ${player.id}:`,
        error,
      );

      throw new Error(
        `Error occurred while retrieving team for player with ID ${player.id}`,
      );
    }
  }

  @ResolveField('matches')
  async matches(@Parent() player: Player): Promise<Match[]> {
    try {
      return await this.matchesForPlayerLoader.load(player.id);
    } catch (error) {
      console.error(
        `Error fetching matches for player with ID ${player.id}:`,
        error,
      );

      throw new Error(
        `Error occurred while retrieving matches for player with ID ${player.id}`,
      );
    }
  }
}
