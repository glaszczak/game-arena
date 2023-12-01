import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Team } from 'src/teams/entities/team.entity';
import { Match } from 'src/matches/entities/match.entity';
import { IEdge, IPaginated } from 'src/common/interfaces/paginated.interface';
import { PageInfoType } from 'src/common/gql-types/paginated.type';

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

@ObjectType()
class PlayerEdge implements IEdge<Player> {
  @Field(() => String)
  cursor: string;

  @Field(() => Player)
  node: Player;
}

@ObjectType()
export class PlayerConnection implements IPaginated<Player> {
  @Field(() => [PlayerEdge])
  edges: PlayerEdge[];

  @Field(() => PageInfoType)
  pageInfo: PageInfoType;

  @Field(() => Int)
  previousCount: number;

  @Field(() => Int)
  currentCount: number;
}
