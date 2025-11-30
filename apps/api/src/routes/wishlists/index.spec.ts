import { describe, expect, it } from "vitest";

import type { Err, Ok } from "$lib/types/result";
import type {
  WishlistsGetResponse,
  WishlistsListResponse,
} from "$lib/types/routes/wishlists";

import { testUsers } from "$test/fixtures/users";
import { testWishlists } from "$test/fixtures/wishlists";
import { createAuthenticatedFetch } from "$test/utils/auth";
import { testFetch } from "$test/utils/fetch";

describe("Wishlists", () => {
  describe("GET /wishlists", () => {
    it("should return all wishlists", async () => {
      const response = await testFetch("/wishlists");

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<WishlistsListResponse>;
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data!.length).toBe(Object.keys(testWishlists).length);
    });

    it("should return wishlists ordered by name", async () => {
      const response = await testFetch("/wishlists");

      const json = (await response.json()) as Ok<WishlistsListResponse>;
      const names = json.data!.map((w) => w.name);

      expect(names).toEqual([...names].sort());
    });
  });

  describe("GET /wishlists/:wishlistId", () => {
    it("should return a single wishlist", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
      );

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<WishlistsGetResponse>;
      expect(json.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data!.id).toBe(testWishlists.Birthday.id);
      expect(json.data!.name).toBe(testWishlists.Birthday.name);
      expect(json.data!.description).toBe(testWishlists.Birthday.description);
    });

    it("should return 404 for non-existent wishlist", async () => {
      const response = await testFetch("/wishlists/non-existent-id");

      expect(response.status).toBe(404);

      const json = (await response.json()) as Err;
      expect(json.status).toBe(404);
      expect(json.message).toBe("Wishlist not found");
    });
  });

  describe("POST /wishlists", () => {
    it("should create a wishlist as admin", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch("/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Test Wishlist",
          description: "A new wishlist for testing",
        }),
      });

      expect(response.status).toBe(201);

      const json = (await response.json()) as Ok<undefined>;
      expect(json.status).toBe(201);
      expect(json.message).toBe("Wishlist created");
    });

    it("should create a wishlist without description", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch("/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Wishlist Without Description",
        }),
      });

      expect(response.status).toBe(201);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch("/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Unauthorized Wishlist",
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as User (not Admin)", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch("/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "User Wishlist",
        }),
      });

      expect(response.status).toBe(403);
    });

    it("should return 400 with invalid data", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch("/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
        }),
      });

      expect(response.status).toBe(400);

      const json = (await response.json()) as Err;
      expect(json.status).toBe(400);
      expect(json.errors).toBeDefined();
    });
  });

  describe("PUT /wishlists/:wishlistId", () => {
    it("should update a wishlist as admin", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Updated Birthday Wishlist",
            description: "Updated description",
          }),
        },
      );

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<undefined>;
      expect(json.message).toBe("Wishlist updated");
    });

    it("should return 404 for non-existent wishlist", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch("/wishlists/non-existent-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Name",
        }),
      });

      expect(response.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Unauthorized Update",
          }),
        },
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as User (not Admin)", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User Update",
          }),
        },
      );

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /wishlists/:wishlistId", () => {
    it("should delete a wishlist as admin", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch(
        `/wishlists/${testWishlists.Empty.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(200);

      const json = (await response.json()) as Ok<undefined>;
      expect(json.message).toBe("Wishlist deleted");

      const getResponse = await testFetch(
        `/wishlists/${testWishlists.Empty.id}`,
      );
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent wishlist", async () => {
      const adminFetch = await createAuthenticatedFetch(testUsers.Admin);

      const response = await adminFetch("/wishlists/non-existent-id", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await testFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when authenticated as User (not Admin)", async () => {
      const userFetch = await createAuthenticatedFetch(testUsers.UserOne);

      const response = await userFetch(
        `/wishlists/${testWishlists.Birthday.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(403);
    });
  });
});
