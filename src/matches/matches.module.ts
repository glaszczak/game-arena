import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesResolver } from './matches.resolver';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { Player } from 'src/players/entities/player.entity';
import { Team } from 'src/teams/entities/team.entity';
import { TeamsWithPlayersForMatchLoader } from 'src/database/data-loaders/match/teams-with-players-for-match.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Player, Team])],
  providers: [MatchesResolver, MatchesService, TeamsWithPlayersForMatchLoader],
})
export class MatchesModule {}
