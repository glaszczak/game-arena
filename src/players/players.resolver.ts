import { Resolver, Query } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private readonly playersService: PlayersService) {}

  @Query(() => [Player], { name: 'players' })
  findAll() {
    return this.playersService.findAll();
  }
}
