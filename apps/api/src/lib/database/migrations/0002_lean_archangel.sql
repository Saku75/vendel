DROP INDEX `wishes_wishlist_id_title_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `wishes_wishlistId_title_unique` ON `wishes` (`wishlist_id`,`title`);--> statement-breakpoint
DROP INDEX `wishlist_users_wishlist_id_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_users_wishlistId_userId_unique` ON `wishlist_users` (`wishlist_id`,`user_id`);