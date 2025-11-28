PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`first_name` text(64) NOT NULL,
	`middle_name` text(256),
	`last_name` text(64),
	`email` text(320) NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password` blob NOT NULL,
	`client_salt` text(64) NOT NULL,
	`server_salt` text(64) NOT NULL,
	`role` text(16) DEFAULT 'guest' NOT NULL,
	`approved` integer DEFAULT false NOT NULL,
	`approved_by` text(24),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "middle_name", "last_name", "email", "email_verified", "password", "client_salt", "server_salt", "role", "approved", "approved_by", "created_at", "updated_at") SELECT "id", "first_name", "middle_name", "last_name", "email", "email_verified", "password", "client_salt", "server_salt", "role", "approved", "approved_by", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);