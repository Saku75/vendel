CREATE TABLE `users` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`first_name` text(64) NOT NULL,
	`middle_name` text(256),
	`last_name` text(64),
	`email` text(320) NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password` text(128),
	`client_salt` text(64) NOT NULL,
	`server_salt` text(64) NOT NULL,
	`role` text(16),
	`approved` integer DEFAULT false NOT NULL,
	`approved_by` text(24),
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);