import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { Match } from 'src/matches/entities/match.entity';
import { Team } from 'src/teams/entities/team.entity';
import { MatchesForPlayerLoader } from 'src/database/data-loaders/player/matches-for-player.loader';
import { TeamForPlayerLoader } from 'src/database/data-loaders/player/team-for-player.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Match, Team])],
  providers: [
    PlayersResolver,
    PlayersService,
    MatchesForPlayerLoader,
    TeamForPlayerLoader,
  ],
})
export class PlayersModule {}
