import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";
import { HttpStatus } from "$lib/enums/http.status";
import { validate } from "$lib/middleware/validate";
import { categoryValidation } from "$lib/validations/request/categories";
import { categoryIdExistsObject } from "$lib/validations/request/categories.utils";

import {
  ApiCategoriesResponse,
  ApiCategoryCreateResponse,
  ApiCategoryDeleteResponse,
  ApiCategoryGetResponse,
  ApiCategoryUpdateResponse,
} from "./categories.response";

const categoriesRoutes = app();

// Get all categories
categoriesRoutes.get("/", async (c) => {
  const [categories, totalCount] = await Promise.all([
    database().select().from(categoriesSchema),
    database().$count(categoriesSchema),
  ]);

  return c.json({
    data: {
      categories,
      totalCount,
    },
  } satisfies ApiCategoriesResponse);
});

// Create category
categoriesRoutes.post("/", validate("json", categoryValidation), async (c) => {
  const data = c.req.valid("json");

  await database().insert(categoriesSchema).values(data);

  return c.json({ success: true } satisfies ApiCategoryCreateResponse, 201);
});

// Get category
categoriesRoutes.get(
  "/:categoryId",
  validate("param", categoryIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { categoryId } = c.req.valid("param");

    const [category] = await database()
      .select()
      .from(categoriesSchema)
      .where(eq(categoriesSchema.id, categoryId))
      .limit(1);

    return c.json({ data: category } satisfies ApiCategoryGetResponse);
  },
);

// Update category
categoriesRoutes.put(
  "/:categoryId",
  validate("param", categoryIdExistsObject, HttpStatus.NotFound),
  validate("json", categoryValidation),
  async (c) => {
    const { categoryId } = c.req.valid("param");
    const data = c.req.valid("json");

    await database()
      .update(categoriesSchema)
      .set(data)
      .where(eq(categoriesSchema.id, categoryId));

    return c.json({ success: true } satisfies ApiCategoryUpdateResponse);
  },
);

// Delete category
categoriesRoutes.delete(
  "/:categoryId",
  validate("param", categoryIdExistsObject, HttpStatus.NotFound),
  async (c) => {
    const { categoryId } = c.req.valid("param");

    await database()
      .delete(categoriesSchema)
      .where(eq(categoriesSchema.id, categoryId));

    return c.json({ success: true } satisfies ApiCategoryDeleteResponse);
  },
);

export { categoriesRoutes };
