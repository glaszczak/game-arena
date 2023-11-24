import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { PlayersForTeamLoader } from 'src/database/data-loaders/team/players-for-team.loader';
import { Player } from 'src/players/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Player])],
  providers: [TeamsResolver, TeamsService, PlayersForTeamLoader],
})
export class TeamsModule {}
