import { Injectable } from '@nestjs/common';

@Injectable()
export class TeamsService {
  teams() {
    return `This action returns all teams`;
  }

  teamPlayers(teamId: number) {
    return `This action returns a #${teamId} team`;
  }
}
