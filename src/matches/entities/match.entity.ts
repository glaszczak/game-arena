import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Player } from 'src/players/entities/player.entity';
import {
  IEdge,
  IRelayPaginated,
} from 'src/common/interfaces/paginated.interface';
import { PageInfoType } from 'src/common/gql-types/relay-paginated.type';

@ObjectType('Match')
@Entity({ name: 'Match' })
export class Match extends AbstractEntity<Match> {
  @Field()
  @Column()
  location: string;

  @Field()
  @Column()
  date: Date;

  @Field()
  @Column()
  time: string;

  @ManyToMany(() => Player, (player) => player.matches, { cascade: true })
  @JoinTable({ name: 'Match_Player' })
  @Field(() => [Player], { nullable: true })
  players: Player[];
}

@ObjectType()
class MatchEdge implements IEdge<Match> {
  @Field(() => String)
  cursor: string;

  @Field(() => Match)
  node: Match;
}

@ObjectType()
export class MatchConnection implements IRelayPaginated<Match> {
  @Field(() => [MatchEdge])
  edges: MatchEdge[];

  @Field(() => PageInfoType)
  pageInfo: PageInfoType;

  @Field(() => Int)
  previousCount: number;

  @Field(() => Int)
  currentCount: number;
}
