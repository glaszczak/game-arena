import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team, TeamConnection } from './entities/team.entity';
import { Player } from 'src/players/entities/player.entity';
import { PlayersForTeamLoader } from 'src/database/data-loaders/team/players-for-team.loader';
import { QueryOrderEnum } from 'src/common/enums/query-order.enum';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly playersForTeamLoader: PlayersForTeamLoader,
  ) {}

  @Query(() => TeamConnection, { name: 'teams' })
  async teams(
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('after', { type: () => Int, nullable: true }) after?: number,
    @Args('before', { type: () => Int, nullable: true }) before?: number,
    @Args('order', {
      type: () => QueryOrderEnum,
      nullable: true,
    })
    order?: QueryOrderEnum,
  ) {
    return this.teamsService.teams(first, last, after, before, order);
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
