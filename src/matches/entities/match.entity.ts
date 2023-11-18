import { Column, Entity } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from 'src/database/entities/abstract.entity';

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
}
