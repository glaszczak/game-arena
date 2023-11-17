import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesResolver } from './matches.resolver';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [MatchesResolver, MatchesService],
})
export class MatchesModule {}
