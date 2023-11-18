import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Player } from 'src/players/entities/player.entity';

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
