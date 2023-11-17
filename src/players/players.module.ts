import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayersResolver, PlayersService],
})
export class PlayersModule {}
