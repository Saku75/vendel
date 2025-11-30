import type { TestWish } from "../types/wish";
import { testWishlists } from "./wishlists";

const testWishes: Record<string, TestWish> = {
  Laptop: {
    id: "wish_laptop-id",
    wishlistId: testWishlists.Birthday.id,
    title: "Gaming Laptop",
    brand: "ASUS",
    description: "A powerful laptop for gaming",
    price: 1500,
    url: "https://example.com/laptop",
  },
  Headphones: {
    id: "wish_headphones-id",
    wishlistId: testWishlists.Birthday.id,
    title: "Wireless Headphones",
    brand: "Sony",
    description: null,
    price: 350,
    url: "https://example.com/headphones",
  },
  Book: {
    id: "wish_book-id",
    wishlistId: testWishlists.Christmas.id,
    title: "Programming Book",
    brand: null,
    description: "Learn TypeScript",
    price: null,
    url: null,
  },
} as const;

export { testWishes };
