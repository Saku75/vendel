import { describe, expect, it } from "vitest";

import type {
  WishesCreateResponse,
  WishesDeleteResponse,
  WishesGetResponse,
  WishesListResponse,
  WishesUpdateResponse,
} from "$lib/types";
import type { Err, Ok } from "$lib/types/result";

import { testUsers } from "$test/fixtures/users";
import { testWishes } from "$test/fixtures/wishes";
import { testWishlists } from "$test/fixtures/wishlists";
import { createAuthenticatedFetch } from "$test/utils/auth";
import { testFetch } from "$test/utils/fetch";

describe("Wishes", () => {
  describe("GET /:wishlistId/wishes", () => {
    it("should return all wishes for a wishlist", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
      );

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WishesListResponse>>();
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.length).toBe(2);
    });

    it("should return wishes ordered by title", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
      );

      const json = await response.json<Ok<WishesListResponse>>();
      const titles = json.data.map((w) => w.title);

      expect(titles).toEqual([...titles].sort());
    });

    it("should return empty array for wishlist with no wishes", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Empty.id}/wishes`,
      );

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WishesListResponse>>();
      expect(json.data).toEqual([]);
    });
  });

  describe("GET /:wishlistId/wishes/:wishId", () => {
    it("should return a single wish", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Laptop.id}`,
      );

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WishesGetResponse>>();
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(testWishes.Laptop.id);
      expect(json.data.title).toBe(testWishes.Laptop.title);
      expect(json.data.brand).toBe(testWishes.Laptop.brand);
      expect(json.data.description).toBe(testWishes.Laptop.description);
      expect(json.data.price).toBe(testWishes.Laptop.price);
      expect(json.data.url).toBe(testWishes.Laptop.url);
    });

    it("should return 404 for non-existent wish", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/non-existent-id`,
      );

      expect(response.status).toBe(404);

      const json = await response.json<Err>();
      expect(json.status).toBe(404);
      expect(json.message).toBe("Wish not found");
    });

    it("should return 404 when wish exists but in different wishlist", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Book.id}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe("POST /:wishlistId/wishes", () => {
    it("should create a wish as user", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Test Wish",
            brand: "Test Brand",
            description: "A test wish",
            price: 9999,
            url: "https://example.com/test",
          }),
        },
      );

      expect(response.status).toBe(201);

      const json = await response.json<Ok<WishesCreateResponse>>();
      expect(json.status).toBe(201);
      expect(json.message).toBe("Wish created successfully");
    });

    it("should create a wish with only required fields", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Minimal Wish",
          }),
        },
      );

      expect(response.status).toBe(201);
    });

    it("should return 404 for non-existent wishlist", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch("/wishlists/non-existent-id/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Wish for non-existent wishlist",
        }),
      });

      expect(response.status).toBe(404);

      const json = await response.json<Err>();
      expect(json.message).toBe("Wishlist not found");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Unauthorized Wish",
          }),
        },
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as Guest", async () => {
      const guestFetch = await createAuthenticatedFetch(testUsers.UserTwo);

      const response = await guestFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Guest Wish",
          }),
        },
      );

      expect(response.status).toBe(403);
    });

    it("should return 400 with invalid data", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "",
          }),
        },
      );

      expect(response.status).toBe(400);

      const json = await response.json<Err>();
      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
    });
  });

  describe("PUT /:wishlistId/wishes/:wishId", () => {
    it("should update a wish as user", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Headphones.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Updated Headphones",
            brand: "Bose",
            description: "Updated description",
            price: 40000,
            url: "https://example.com/updated",
          }),
        },
      );

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WishesUpdateResponse>>();
      expect(json.message).toBe("Wish updated successfully");
    });

    it("should return 404 for non-existent wish", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/non-existent-id`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Updated Title",
          }),
        },
      );

      expect(response.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Laptop.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Unauthorized Update",
          }),
        },
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as Guest", async () => {
      const guestFetch = await createAuthenticatedFetch(testUsers.UserTwo);

      const response = await guestFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Laptop.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Guest Update",
          }),
        },
      );

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /:wishlistId/wishes/:wishId", () => {
    it("should delete a wish as user", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Christmas.id}/wishes/${testWishes.Book.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(200);

      const json = await response.json<Ok<WishesDeleteResponse>>();
      expect(json.message).toBe("Wish deleted successfully");

      const getResponse = await testFetch(
        `/wishlists/${testWishlists.Christmas.id}/wishes/${testWishes.Book.id}`,
      );
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent wish", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/non-existent-id`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Laptop.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as Guest", async () => {
      const guestFetch = await createAuthenticatedFetch(testUsers.UserTwo);

      const response = await guestFetch(
        `/wishlists/${testWishlists.Birthday.id}/wishes/${testWishes.Laptop.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(403);
    });
  });
});
