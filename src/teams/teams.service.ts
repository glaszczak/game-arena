import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  teams() {
    return this.teamRepository.find();
  }

  teamPlayers(teamId: number) {
    return `This action returns a #${teamId} team`;
  }
}
