import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';

@ObjectType('Player')
@Entity({ name: 'Player' })
export class Player extends AbstractEntity<Player> {
  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  number: number;

  @Field({ nullable: true })
  @ManyToOne(() => Team, (team) => team.players)
  @JoinColumn()
  @Index()
  team: Team;

  @ManyToMany(() => Match, (match) => match.players)
  @Field(() => [Match], { nullable: true })
  matches: Match[];
}
