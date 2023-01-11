import {MigrationInterface, QueryRunner} from "typeorm";

export class init1673191376960 implements MigrationInterface {
    name = 'init1673191376960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."admin_role_enum" AS ENUM('admin', 'superAdmin')`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" SERIAL NOT NULL, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), "name" character varying NOT NULL, "password" character varying(300) NOT NULL, "user_name" character varying NOT NULL, "access_token" character varying, "safeId" integer, "role" "public"."admin_role_enum" NOT NULL DEFAULT 'admin', "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_e2ca4b65f127467fe2dd1f4d7ce" UNIQUE ("user_name"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "log" ("id" SERIAL NOT NULL, "context" character varying NOT NULL, "message" character varying NOT NULL, "level" character varying NOT NULL, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "members" ("id" SERIAL NOT NULL, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300), "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "members"`);
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
    }

}
