import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Player {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  number: number;

  @Field()
  teamId: string;
}
