import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { Player } from 'src/players/entities/player.entity';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService) {}

  @Query(() => [Team], { name: 'teams' })
  teams() {
    return this.teamsService.teams();
  }

  @Query(() => [Player], { name: 'teamPlayers' })
  async teamPlayers(
    @Args('teamId', { type: () => Int }) teamId: number,
  ): Promise<Player[]> {
    return this.teamsService.teamPlayers(teamId);
  }
}
