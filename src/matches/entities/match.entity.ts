import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Player } from 'src/players/entities/player.entity';

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
