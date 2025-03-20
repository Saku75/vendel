PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_wishes` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`wishlist_id` text(24) NOT NULL,
	`category_id` text(24) NOT NULL,
	`title` text(100) NOT NULL,
	`brand` text(50),
	`description` text(500),
	`price` real,
	`link` text(2083),
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_wishes`("id", "wishlist_id", "category_id", "title", "brand", "description", "price", "link", "created_at", "updated_at") SELECT "id", "wishlist_id", "category_id", "title", "brand", "description", "price", "link", "created_at", "updated_at" FROM `wishes`;--> statement-breakpoint
DROP TABLE `wishes`;--> statement-breakpoint
ALTER TABLE `__new_wishes` RENAME TO `wishes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `wishes_wishlistId_title_unique` ON `wishes` (`wishlist_id`,`title`);