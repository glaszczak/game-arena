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
    try {
      return await this.teamsService.teams(first, last, after, before, order);
    } catch (error) {
      console.error('Error in teams query:', error);

      throw new Error('Error occurred while retrieving teams');
    }
  }

  @Query(() => [Player], { name: 'playersPerTeam' })
  async teamPlayers(
    @Args('teamId', { type: () => Int }) teamId: number,
  ): Promise<Player[]> {
    try {
      return await this.playersForTeamLoader.load(teamId);
    } catch (error) {
      console.error(
        `Error fetching players for team with ID ${teamId}:`,
        error,
      );

      throw new Error('Failed to load players for the team');
    }
  }

  @ResolveField('players')
  async players(@Parent() team: Team): Promise<Player[]> {
    try {
      return await this.playersForTeamLoader.load(team.id);
    } catch (error) {
      console.error(
        `Error fetching players for team with ID ${team.id}:`,
        error,
      );

      throw new Error(`Failed to load players for team with ID ${team.id}`);
    }
  }
}
