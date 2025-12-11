CREATE TABLE `user_emails` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`user_id` text(24) NOT NULL,
	`email` text(320) NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`primary` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_emails_email_unique` ON `user_emails` (`email`);--> statement-breakpoint
CREATE TABLE `user_passwords` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`user_id` text(24) NOT NULL,
	`password_hash` blob NOT NULL,
	`client_salt` text(64) NOT NULL,
	`server_salt` text(64) NOT NULL,
	`version` text(16) DEFAULT 'v1' NOT NULL,
	`current` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `user_emails` (`id`, `user_id`, `email`, `verified`, `primary`, `created_at`)
SELECT
	lower(hex(randomblob(12))),
	`id`,
	`email`,
	`email_verified`,
	1,
	`created_at`
FROM `users`
WHERE `email` IS NOT NULL;
--> statement-breakpoint
INSERT INTO `user_passwords` (`id`, `user_id`, `password_hash`, `client_salt`, `server_salt`, `version`, `current`, `created_at`)
SELECT
	lower(hex(randomblob(12))),
	`id`,
	`password`,
	`client_salt`,
	`server_salt`,
	'v1',
	1,
	`created_at`
FROM `users`
WHERE `password` IS NOT NULL;
--> statement-breakpoint
DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email_verified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `client_salt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `server_salt`;