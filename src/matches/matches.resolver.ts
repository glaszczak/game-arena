import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Args,
  Int,
} from '@nestjs/graphql';
import { MatchesService } from './matches.service';
import { Match, MatchConnection } from './entities/match.entity';
import { Team } from 'src/teams/entities/team.entity';
import { TeamsWithPlayersForMatchLoader } from 'src/database/data-loaders/match/teams-with-players-for-match.loader';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly teamsWithPlayersForMatchLoader: TeamsWithPlayersForMatchLoader,
  ) {}

  @Query(() => MatchConnection, { name: 'matches' })
  async matches(
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('after', { type: () => Int, nullable: true }) after?: number,
    @Args('before', { type: () => Int, nullable: true }) before?: number,
    @Args('order', {
      type: () => QueryOrderEnum,
      nullable: true,
    })
    order?: QueryOrderEnum,
  ): Promise<MatchConnection> {
    try {
      return await this.matchesService.matches(
        first,
        last,
        after,
        before,
        order,
      );
    } catch (error) {
      console.error('Error in matches query:', error);

      throw new Error('Error occurred while retrieving matches');
    }
  }

  @Query(() => [Team], { name: 'teamsWithPlayersPerMatch' })
  async matchWitDetails(
    @Args('matchId', { type: () => Int }) matchId: number,
  ): Promise<Team[]> {
    try {
      return await this.teamsWithPlayersForMatchLoader.load(matchId);
    } catch (error) {
      console.error(
        `Error fetching teams with players for match with ID ${matchId}:`,
        error,
      );
      throw new Error('Failed to load teams with players for the match');
    }
  }

  @ResolveField('teams', () => [Team])
  async teams(@Parent() match: Match): Promise<Team[]> {
    try {
      return await this.teamsWithPlayersForMatchLoader.load(match.id);
    } catch (error) {
      console.error(
        `Error fetching teams for match with ID ${match.id}:`,
        error,
      );
      throw new Error(`Failed to load teams for match with ID ${match.id}`);
    }
  }
}
