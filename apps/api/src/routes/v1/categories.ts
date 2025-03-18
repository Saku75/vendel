import { eq } from "drizzle-orm";

import { app } from "$lib/app";
import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";
import { categoryExists } from "$lib/validations/data/category.exists";

const categoriesRoutes = app();

// Get all categories
categoriesRoutes.get("/", async (c) => {
  const categories = await database().select().from(categoriesSchema);

  return c.json(categories);
});

// Create category
categoriesRoutes.post("/", async (c) => {
  const data = (await c.req.json()) as {
    name: string;
  };

  await database().insert(categoriesSchema).values(data);

  return c.body(null, 201);
});

// Get category
categoriesRoutes.get("/:categoryId", async (c) => {
  const { categoryId } = c.req.param();

  if (!(await categoryExists(categoryId))) return c.notFound();

  const [category] = await database()
    .select()
    .from(categoriesSchema)
    .where(eq(categoriesSchema.id, categoryId))
    .limit(1);

  return c.json(category);
});

// Update category
categoriesRoutes.put("/:categoryId", async (c) => {
  const { categoryId } = c.req.param();

  if (!(await categoryExists(categoryId))) return c.notFound();

  const data = (await c.req.json()) as {
    name: string;
  };

  await database()
    .update(categoriesSchema)
    .set(data)
    .where(eq(categoriesSchema.id, categoryId));

  return c.body(null, 204);
});

// Delete category
categoriesRoutes.delete("/:categoryId", async (c) => {
  const { categoryId } = c.req.param();

  if (!(await categoryExists(categoryId))) return c.notFound();

  await database()
    .delete(categoriesSchema)
    .where(eq(categoriesSchema.id, categoryId));

  return c.body(null, 204);
});

export { categoriesRoutes };
