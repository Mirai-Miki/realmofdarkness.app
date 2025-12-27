CREATE TABLE "characters" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"userId" bigint NOT NULL,
	"guildId" bigint,
	"splat" character_splats DEFAULT 'vampire5th' NOT NULL,
	"isSheet" boolean DEFAULT false NOT NULL,
	"data" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "characters_name_userId_unique" UNIQUE("name","userId")
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"iconUrl" varchar(500) DEFAULT '' NOT NULL,
	"storytellerRoleIds" bigint[] DEFAULT '{}' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"username" varchar(35) NOT NULL,
	"displayName" varchar(35) DEFAULT '' NOT NULL,
	"email" varchar(100),
	"avatarUrl" varchar(500) DEFAULT '' NOT NULL,
	"registered" boolean DEFAULT false NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"guildId" bigint NOT NULL,
	"userId" bigint NOT NULL,
	"admin" boolean DEFAULT false NOT NULL,
	"roleIds" bigint[] DEFAULT '{}' NOT NULL,
	"boosted" integer DEFAULT 0 NOT NULL,
	"nickname" varchar(35) DEFAULT '' NOT NULL,
	"avatarUrl" varchar(500) DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_guildId_userId_pk" PRIMARY KEY("guildId","userId")
);
--> statement-breakpoint
CREATE TABLE "initiative_trackers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"guildId" bigint NOT NULL,
	"data" jsonb NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_stats" (
	"id" bigint PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"botId" bigint NOT NULL,
	"command" varchar(100) NOT NULL,
	"used" integer DEFAULT 1 NOT NULL,
	"lastUsed" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "command_stats_userId_command_botId_unique" UNIQUE("userId","command","botId")
);
--> statement-breakpoint
CREATE TABLE "supporters" (
	"userId" bigint PRIMARY KEY NOT NULL,
	"level" "supporter_level" DEFAULT 'base' NOT NULL,
	"boosts" integer DEFAULT 0 NOT NULL,
	"firstSupported" timestamp
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_guildId_guilds_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_guildId_guilds_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_trackers" ADD CONSTRAINT "initiative_trackers_guildId_guilds_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_stats" ADD CONSTRAINT "command_stats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supporters" ADD CONSTRAINT "supporters_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "characters_name_user_idx" ON "characters" USING btree ("name","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_guild_idx" ON "characters" USING btree ("guildId");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_user_guild_idx" ON "characters" USING btree ("userId","guildId");