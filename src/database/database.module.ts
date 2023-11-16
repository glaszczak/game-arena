import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from 'src/players/entities/player.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.getOrThrow('DB_HOST'),
          port: parseInt(configService.getOrThrow('DB_PORT'), 10),
          username: configService.getOrThrow('DB_USERNAME'),
          password: configService.getOrThrow('DB_PASSWORD'),
          database: configService.getOrThrow('DB_DATABASE_NAME'),
          entities: [Player],
          synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
