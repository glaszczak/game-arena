import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Player } from 'src/players/entities/player.entity';
import { IEdge, IPaginated } from 'src/common/interfaces/paginated.interface';
import { PageInfoType } from 'src/common/gql-types/paginated.type';

@ObjectType('Team')
@Entity({ name: 'Team' })
export class Team extends AbstractEntity<Team> {
  @Field()
  @Column()
  @Index()
  name: string;

  @Field(() => [Player])
  @OneToMany(() => Player, (player) => player.team, { cascade: true })
  players: Player[];
}

@ObjectType()
class TeamEdge implements IEdge<Team> {
  @Field(() => String)
  cursor: string;

  @Field(() => Team)
  node: Team;
}

@ObjectType()
export class TeamConnection implements IPaginated<Team> {
  @Field(() => [TeamEdge])
  edges: TeamEdge[];

  @Field(() => PageInfoType)
  pageInfo: PageInfoType;

  @Field(() => Int)
  previousCount: number;

  @Field(() => Int)
  currentCount: number;
}
