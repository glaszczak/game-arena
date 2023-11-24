import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { Player } from 'src/players/entities/player.entity';
import { PlayersForTeamLoader } from 'src/database/data-loaders/team/players-for-team.loader';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly playersForTeamLoader: PlayersForTeamLoader,
  ) {}

  @Query(() => [Team], { name: 'teams' })
  teams() {
    return this.teamsService.teams();
  }

  @Query(() => [Player], { name: 'playersPerTeam' })
  async teamPlayers(
    @Args('teamId', { type: () => Int }) teamId: number,
  ): Promise<Player[]> {
    return this.playersForTeamLoader.load(teamId);
  }

  @ResolveField('players')
  async players(@Parent() team: Team): Promise<Player[]> {
    return this.playersForTeamLoader.load(team.id);
  }
}
