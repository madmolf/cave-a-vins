import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { VinsModule } from './vins/vins.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { Vin } from './vins/entities/vin.entity';

function normalizeDatabaseUrl(databaseUrl: string) {
  const schemeEnd = databaseUrl.indexOf('://');
  const credentialsEnd = databaseUrl.lastIndexOf('@');
  if (schemeEnd === -1 || credentialsEnd === -1) return databaseUrl;

  const credentialsStart = schemeEnd + 3;
  const credentials = databaseUrl.slice(credentialsStart, credentialsEnd);
  const separator = credentials.indexOf(':');
  if (separator === -1) return databaseUrl;

  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  const decode = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  return `${databaseUrl.slice(0, credentialsStart)}${encodeURIComponent(
    decode(username),
  )}:${encodeURIComponent(decode(password))}${databaseUrl.slice(
    credentialsEnd,
  )}`;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: normalizeDatabaseUrl(
          configService.getOrThrow<string>('DATABASE_URL'),
        ),
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [Vin],
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    UserModule,
    VinsModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
