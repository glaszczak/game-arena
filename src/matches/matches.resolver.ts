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
    return this.matchesService.matches(first, last, after, before, order);
  }

  @Query(() => [Team], { name: 'teamsWithPlayersPerMatch' })
  async matchWitDetails(
    @Args('matchId', { type: () => Int }) matchId: number,
  ): Promise<Team[]> {
    return this.teamsWithPlayersForMatchLoader.load(matchId);
  }

  @ResolveField('teams', () => [Team])
  async teams(@Parent() match: Match): Promise<Team[]> {
    return this.teamsWithPlayersForMatchLoader.load(match.id);
  }
}
