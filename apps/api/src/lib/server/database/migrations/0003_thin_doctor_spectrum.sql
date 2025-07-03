CREATE TABLE `refresh_token_families` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`user_id` text(24) NOT NULL,
	`invalidated` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`refresh_token_family_id` text(24) NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`expires` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`refresh_token_family_id`) REFERENCES `refresh_token_families`(`id`) ON UPDATE cascade ON DELETE cascade
);
