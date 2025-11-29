CREATE TABLE `wishes` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`wishlist_id` text(24) NOT NULL,
	`title` text(256) NOT NULL,
	`brand` text(128),
	`description` text(512),
	`price` integer,
	`url` text(2048),
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text(128) NOT NULL,
	`description` text(256),
	`wishes_updated_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
