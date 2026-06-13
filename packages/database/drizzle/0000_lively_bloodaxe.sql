CREATE TYPE "public"."character_splats" AS ENUM('vampire5th', 'hunter5th', 'werewolf5th', 'human5th', 'ghoul5th', 'vampire20th', 'werewolf20th', 'changeling20th', 'mage20th', 'demon20th', 'wraith20th', 'human20th', 'ghoul20th');--> statement-breakpoint
CREATE TYPE "public"."character_status" AS ENUM('Draft', 'Review', 'Active', 'Dead', 'Archive');--> statement-breakpoint
CREATE TYPE "public"."supporter_level" AS ENUM('base', 'mortal', 'fledgling', 'neonate', 'ancilla', 'elder', 'methuselah', 'antediluvian');--> statement-breakpoint
CREATE TABLE "characters" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"user_id" bigint NOT NULL,
	"chronicle_id" bigint,
	"splat" character_splats DEFAULT 'vampire5th' NOT NULL,
	"status" character_status DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vampire_5th" (
	"character_id" bigint PRIMARY KEY NOT NULL,
	"hunger" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chronicle_members" (
	"chronicle_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"boosted" integer DEFAULT 0 NOT NULL,
	"nickname" varchar(35) DEFAULT '' NOT NULL,
	"avatar_url" varchar(500) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chronicle_members_chronicle_id_user_id_pk" PRIMARY KEY("chronicle_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chronicles" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon_url" varchar(500) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discord_guild_chronicles" (
	"discord_id" bigint NOT NULL,
	"chronicle_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discord_guild_chronicles_discord_id_chronicle_id_pk" PRIMARY KEY("discord_id","chronicle_id")
);
--> statement-breakpoint
CREATE TABLE "discord_guilds" (
	"discord_id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon_url" varchar(500) DEFAULT '' NOT NULL,
	"storyteller_role_ids" bigint[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"discord_id" bigint,
	"display_name" varchar(35) DEFAULT 'Undefined' NOT NULL,
	"avatar_url" varchar(500) DEFAULT '' NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storytellers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"chronicle_id" bigint NOT NULL,
	"provider" varchar(255) DEFAULT 'hoisted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_trackers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"chronicle_id" bigint NOT NULL,
	"data" jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_stats" (
	"id" bigint PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"bot_id" bigint NOT NULL,
	"command" varchar(100) NOT NULL,
	"used" integer DEFAULT 1 NOT NULL,
	"last_used" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "command_stats_userId_command_botId_unique" UNIQUE("user_id","command","bot_id")
);
--> statement-breakpoint
CREATE TABLE "supporters" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"level" "supporter_level" DEFAULT 'base' NOT NULL,
	"boosts" integer DEFAULT 0 NOT NULL,
	"first_supported" timestamp
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_chronicle_id_chronicles_id_fk" FOREIGN KEY ("chronicle_id") REFERENCES "public"."chronicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_member_composite_fk" FOREIGN KEY ("user_id","chronicle_id") REFERENCES "public"."chronicle_members"("user_id","chronicle_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vampire_5th" ADD CONSTRAINT "vampire_5th_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_members" ADD CONSTRAINT "chronicle_members_chronicle_id_chronicles_id_fk" FOREIGN KEY ("chronicle_id") REFERENCES "public"."chronicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chronicle_members" ADD CONSTRAINT "chronicle_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_chronicles" ADD CONSTRAINT "discord_guild_chronicles_discord_id_discord_guilds_discord_id_fk" FOREIGN KEY ("discord_id") REFERENCES "public"."discord_guilds"("discord_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_chronicles" ADD CONSTRAINT "discord_guild_chronicles_chronicle_id_chronicles_id_fk" FOREIGN KEY ("chronicle_id") REFERENCES "public"."chronicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storytellers" ADD CONSTRAINT "storytellers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storytellers" ADD CONSTRAINT "storytellers_chronicle_id_chronicles_id_fk" FOREIGN KEY ("chronicle_id") REFERENCES "public"."chronicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_trackers" ADD CONSTRAINT "initiative_trackers_chronicle_id_chronicles_id_fk" FOREIGN KEY ("chronicle_id") REFERENCES "public"."chronicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_stats" ADD CONSTRAINT "command_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supporters" ADD CONSTRAINT "supporters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "characters_name_user_idx" ON "characters" USING btree ("name","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_chronicle_idx" ON "characters" USING btree ("chronicle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_user_chronicle_idx" ON "characters" USING btree ("user_id","chronicle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_discord_id_unique" ON "users" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX "storytellers_user_chronicle_idx" ON "storytellers" USING btree ("user_id","chronicle_id");