CREATE TYPE "public"."character_splats" AS ENUM('vampire5th', 'hunter5th', 'werewolf5th', 'human5th', 'ghoul5th', 'vampire20th', 'werewolf20th', 'changeling20th', 'mage20th', 'demon20th', 'wraith20th', 'human20th', 'ghoul20th');--> statement-breakpoint
CREATE TYPE "public"."supporter_level" AS ENUM('base', 'mortal', 'fledgling', 'neonate', 'ancilla', 'elder', 'methuselah', 'antediluvian');--> statement-breakpoint
CREATE TABLE "characters" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"user_id" bigint NOT NULL,
	"guild_id" bigint,
	"splat" character_splats DEFAULT 'vampire5th' NOT NULL,
	"is_sheet" boolean DEFAULT false NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "characters_name_userId_unique" UNIQUE("name","user_id")
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon_url" varchar(500) DEFAULT '' NOT NULL,
	"storyteller_role_ids" bigint[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"username" varchar(35) NOT NULL,
	"display_name" varchar(35) DEFAULT '' NOT NULL,
	"avatar_url" varchar(500) DEFAULT '' NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"guild_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"role_ids" bigint[] DEFAULT '{}' NOT NULL,
	"boosted" integer DEFAULT 0 NOT NULL,
	"nickname" varchar(35) DEFAULT '' NOT NULL,
	"avatar_url" varchar(500) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_guild_id_user_id_pk" PRIMARY KEY("guild_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "initiative_trackers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"guild_id" bigint NOT NULL,
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
ALTER TABLE "characters" ADD CONSTRAINT "characters_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_trackers" ADD CONSTRAINT "initiative_trackers_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_stats" ADD CONSTRAINT "command_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supporters" ADD CONSTRAINT "supporters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "characters_name_user_idx" ON "characters" USING btree ("name","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_guild_idx" ON "characters" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_user_guild_idx" ON "characters" USING btree ("user_id","guild_id");