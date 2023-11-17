import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType('Match')
@Entity({ name: 'Match' })
export class Match {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

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
