import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  providers: [TeamsResolver, TeamsService],
})
export class TeamsModule {}
