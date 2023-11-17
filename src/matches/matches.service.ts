import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchesService {
  matches() {
    return `This action returns all matches`;
  }

  matchTeamsWithPlayers(matchId: number) {
    return `This action returns a #${matchId} match`;
  }
}
