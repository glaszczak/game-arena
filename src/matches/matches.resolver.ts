import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Args,
  Int,
} from '@nestjs/graphql';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { Team } from 'src/teams/entities/team.entity';
import { TeamsWithPlayersForMatchLoader } from 'src/database/data-loaders/match/teams-with-players-for-match.loader';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly teamsWithPlayersForMatchLoader: TeamsWithPlayersForMatchLoader,
  ) {}

  @Query(() => [Match], { name: 'matches' })
  matches() {
    return this.matchesService.matches();
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
