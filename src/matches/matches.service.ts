import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  matches() {
    return this.matchRepository.find();
  }

  matchTeamsWithPlayers(matchId: number) {
    return `This action returns a #${matchId} match`;
  }
}
