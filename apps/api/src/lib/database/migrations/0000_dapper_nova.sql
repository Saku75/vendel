CREATE TABLE `categories` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
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
	`expires` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`refresh_token_family_id`) REFERENCES `refresh_token_families`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`first_name` text(50) NOT NULL,
	`middle_name` text(200),
	`last_name` text(50),
	`email` text(320) NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password` text(128),
	`client_salt` text(64) NOT NULL,
	`server_salt` text(64) NOT NULL,
	`role` text(20),
	`approved` integer DEFAULT false NOT NULL,
	`approved_by` text(24),
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`wishlist_id` text(24) NOT NULL,
	`category_id` text(24) NOT NULL,
	`title` text(100) NOT NULL,
	`brand` text(50),
	`description` text,
	`price` real,
	`link` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishes_wishlist_id_title_unique` ON `wishes` (`wishlist_id`,`title`);--> statement-breakpoint
CREATE TABLE `wishlist_users` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`wishlist_id` text(24) NOT NULL,
	`user_id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_users_wishlist_id_user_id_unique` ON `wishlist_users` (`wishlist_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`date` text(10),
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_name_unique` ON `wishlists` (`name`);