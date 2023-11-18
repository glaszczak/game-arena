import { Column, Entity } from 'typeorm';
import { AbstractEntity } from 'src/database/entities/abstract.entity';
import { Field, ObjectType } from '@nestjs/graphql';

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

  @Field()
  teamId: string;
}
