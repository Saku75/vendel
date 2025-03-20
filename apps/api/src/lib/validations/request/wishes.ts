import { and, eq, ne } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";

import { AppEnv } from "$lib/app";
import { database } from "$lib/database";
import { categoriesSchema } from "$lib/database/schema/categories";
import { wishesSchema } from "$lib/database/schema/wishes";

import {
  WishBrandValidationCode,
  WishCategoryIdValidationCode,
  WishDescriptionValidationCode,
  WishLinkValidationCode,
  WishPriceValidationCode,
  WishTitleValidationCode,
} from "./wishes.codes";

const wishCategoryIdValidation = z
  .string()
  .nonempty(WishCategoryIdValidationCode.Required)
  .cuid2(WishCategoryIdValidationCode.Invalid)
  .superRefine(async (value, context) => {
    const categories = await database()
      .select({ name: categoriesSchema.id })
      .from(categoriesSchema)
      .where(eq(categoriesSchema.id, value));

    if (!categories.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: WishCategoryIdValidationCode.DoesNotExists,
      });
    }
  });

const wishTitleValidation = z
  .string()
  .nonempty(WishTitleValidationCode.Required)
  .max(100, WishTitleValidationCode.TooLong)
  .superRefine(async (value, context) => {
    const { wishlistId, wishId } = getContext<AppEnv>().req.param() as {
      wishlistId: string;
      wishId?: string;
    };

    const wishes = await database()
      .select({
        wishlistId: wishesSchema.wishlistId,
        title: wishesSchema.title,
      })
      .from(wishesSchema)
      .where(
        and(
          wishId ? ne(wishesSchema.id, wishId) : undefined,
          eq(wishesSchema.wishlistId, wishlistId),
          eq(wishesSchema.title, value),
        ),
      );

    if (wishes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: WishTitleValidationCode.AlreadyExists,
      });
    }
  });

const wishBrandValidation = z
  .string()
  .max(50, WishBrandValidationCode.TooLong)
  .optional();

const wishDescriptionIdValidation = z
  .string()
  .max(500, WishDescriptionValidationCode.TooLong)
  .optional();

const wishPriceValidation = z
  .number()
  .positive(WishPriceValidationCode.Negativ)
  .optional();

const wishLinkValidation = z
  .string()
  .max(2083, WishLinkValidationCode.TooLong)
  .url(WishLinkValidationCode.Invalid)
  .optional();

const wishValidation = z.object({
  categoryId: wishCategoryIdValidation,
  title: wishTitleValidation,
  brand: wishBrandValidation,
  description: wishDescriptionIdValidation,
  price: wishPriceValidation,
  link: wishLinkValidation,
});

export {
  wishBrandValidation,
  wishCategoryIdValidation,
  wishDescriptionIdValidation,
  wishLinkValidation,
  wishPriceValidation,
  wishTitleValidation,
  wishValidation,
};
