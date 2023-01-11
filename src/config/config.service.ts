import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const fs = require('fs');

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getRollbar() {
    return this.getValue('ROLLBAR_ACCESS_TOKEN', false);
  }

  public getEnvironment() {
    return this.getValue('MODE', false);
  }

  public getPort() {
    return this.getValue('PORT', true);
  }
  public getLoggingStatus() {
    return this.getValue('LOGGING');
  }
  public getJWTSecret() {
    return this.getValue('JWT_SECRET');
  }
  public getJWTExpire() {
    return this.getValue('JWT_EXPIRE');
  }
  public getIgnoreJWTExpire() {
    return this.getValue('IGNORE_JWT_EXPIRE');
  }
  public getAxiosTimeout() {
    return this.getValue('AXIOS_TIMEOUT');
  }

  public getAxiosRedirectsCount() {
    return this.getValue('AXIOS_REDIRECTS');
  }
  public getKafkaBroker() {
    return this.getValue('KAFKA_BROKER');
  }
  public getKafkaGroupId() {
    return this.getValue('KAFKA_GROUPID');
  }
  public getKafkaClientId() {
    return this.getValue('KAFKA_CLIENTID');
  }
  public getConsoleLogLevel() {
    return this.getValue('CONSOLE_LOG_LEVEL');
  }

  public getFileLogLevel_1() {
    return this.getValue('CONSOLE_LOG_LEVEL_1');
  }

  public getFileLogLevel_2() {
    return this.getValue('CONSOLE_LOG_LEVEL_1');
  }
  public getZahaUserId() {
    return this.getValue('ZAHA_DAFUSERID');
  }
  public getZahaKey() {
    return this.getValue('ZAHA_DAFKEY');
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    if (mode === 'DEV' || mode === 'LOCAL') return false;
    return true;
  }
  public getAxiosConfig(): Object {
    return {
      timeout: process.env.AXIOS_TIMEOUT,
      maxRedirects: process.env.AXIOS_TIMEOUTAXIOS_REDIRECTS,
    };
  }
  public getRedisConfig(): RedisModuleOptions {
    return {
      closeClient: true,
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        onClientCreated(client) {
          client.on('error', (err) => {});
        },
      },
    };
  }
  public getmicroserviceConfig() {
    return {
      name: 'AUTH_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: process.env.RABBITMQ_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    };
  }
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      logging: !!this.getValue('LOGGING'),
      logger: 'simple-console',
      keepConnectionAlive: true,
      migrationsTableName: 'migration',
      migrationsRun: true,
      entities: [
        __dirname + '/../database/entity/*.entity.ts',
        __dirname + '/../database/entity/*.entity.js',
      ],
      migrations: [
        __dirname + '/../database/migration/*.ts',
        __dirname + '/../database/migration/*.js',
      ],
      cli: {
        migrationsDir: 'src/database/migration',
      },

      ssl:
        process.env.DB_SSL == 'production'
          ? {
              rejectUnauthorized: false,
              ca: process.env.CA_DB,
            }
          : false,
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
