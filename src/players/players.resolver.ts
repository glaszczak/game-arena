import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private readonly playersService: PlayersService) {}

  @Query(() => [Player], { name: 'players' })
  players() {
    return this.playersService.players();
  }

  @Query(() => [Team], { name: 'playerTeam' })
  playerTeam(@Args('playerId', { type: () => Int }) playerId: number) {
    return this.playersService.playerTeam(playerId);
  }

  @Query(() => [Match], { name: 'playerMatchesWithTeam' })
  playerMatchesWithTeam(
    @Args('playerId', { type: () => Int }) playerId: number,
  ) {
    return this.playersService.playerMatchesWithTeam(playerId);
  }
}
