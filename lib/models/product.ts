import 'server-only';

import { db } from '../db';
import { products, categories } from '../schema';
import { eq, asc, like, or, and, getTableColumns } from 'drizzle-orm';
import type { Product, CreateProductInput, UpdateProductInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapProduct(row: typeof products.$inferSelect & { category_name: string | null }): Product {
  return {
    ...row,
    created_at: row.created_at?.toISOString() ?? new Date().toISOString(),
    updated_at: row.updated_at?.toISOString() ?? new Date().toISOString(),
    category_name: row.category_name ?? undefined,
  };
}

export async function getAllProducts(categoryId?: number): Promise<Product[]> {
  const userId = await requireUserId();

  const baseConditions = [eq(products.user_id, userId)];
  if (categoryId) {
    baseConditions.push(eq(products.category_id, categoryId));
  }

  const result = await db.select({
    ...getTableColumns(products),
    category_name: categories.name,
  })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(...baseConditions))
    .orderBy(asc(products.name));

  return result.map(mapProduct);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const userId = await requireUserId();

  const result = await db.select({
    ...getTableColumns(products),
    category_name: categories.name,
  })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.id, id), eq(products.user_id, userId)));

  if (result.length === 0) return undefined;
  return mapProduct(result[0]);
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const userId = await requireUserId();

  const result = await db.select({
    ...getTableColumns(products),
    category_name: categories.name,
  })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.sku, sku), eq(products.user_id, userId)));

  if (result.length === 0) return undefined;
  return mapProduct(result[0]);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const userId = await requireUserId();

  const result = await db.insert(products).values({
    user_id: userId,
    sku: input.sku,
    name: input.name,
    description: input.description,
    unit_price: input.unit_price,
    category_id: input.category_id,
  }).returning();

  return {
    ...result[0],
    created_at: result[0].created_at?.toISOString() ?? new Date().toISOString(),
    updated_at: result[0].updated_at?.toISOString() ?? new Date().toISOString(),
    category_name: undefined,
  };
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Product | undefined> {
  const existing = await getProductById(id);
  if (!existing) return undefined;

  await db.update(products).set({
    ...input,
    updated_at: new Date(),
  })
    .where(eq(products.id, id));

  return getProductById(id);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const userId = await requireUserId();

  const result = await db.delete(products)
    .where(and(eq(products.id, id), eq(products.user_id, userId)))
    .returning({ id: products.id });
  return result.length > 0;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const userId = await requireUserId();
  const searchTerm = `%${query}%`;

  const result = await db.select({
    ...getTableColumns(products),
    category_name: categories.name,
  })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(
      eq(products.user_id, userId),
      or(
        like(products.name, searchTerm),
        like(products.sku, searchTerm),
        like(products.description, searchTerm)
      )
    ))
    .orderBy(asc(products.name));

  return result.map(mapProduct);
}
