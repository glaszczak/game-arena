import { Column, Entity } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';

@ObjectType('Team')
@Entity({ name: 'Team' })
export class Team extends AbstractEntity<Team> {
  @Field()
  @Column()
  name: string;
}
