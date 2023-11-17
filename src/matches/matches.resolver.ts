import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(private readonly matchesService: MatchesService) {}

  @Query(() => [Match], { name: 'matches' })
  matches() {
    return this.matchesService.matches();
  }

  @Query(() => Match, { name: 'matchTeamsAndPlayers' })
  matchTeamsWithPlayers(@Args('matchId', { type: () => Int }) matchId: number) {
    return this.matchesService.matchTeamsWithPlayers(matchId);
  }
}
