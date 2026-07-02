import { db } from '../db';
import { categories, products } from '../schema';
import { and, asc, eq, isNull, or } from 'drizzle-orm';
import type { Category, CreateCategoryInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapCategory(c: typeof categories.$inferSelect): Category {
    return {
        ...c,
        created_at: c.created_at?.toISOString() ?? new Date().toISOString(),
    };
}

export async function getAllCategories(): Promise<Category[]> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(categories)
        .where(or(eq(categories.user_id, userId), isNull(categories.user_id)))
        .orderBy(asc(categories.name));
    return result.map(mapCategory);
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(categories)
        .where(and(
            eq(categories.id, id),
            or(eq(categories.user_id, userId), isNull(categories.user_id))
        ));
    if (result.length === 0) return undefined;
    return mapCategory(result[0]);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
    const userId = await requireUserId();

    const result = await db.insert(categories).values({
        user_id: userId,
        name: input.name,
    }).returning();

    return mapCategory(result[0]);
}

export async function updateCategory(id: number, name: string): Promise<Category | undefined> {
    const userId = await requireUserId();

    const result = await db.update(categories)
        .set({ name })
        .where(and(eq(categories.id, id), eq(categories.user_id, userId)))
        .returning();
    if (result.length === 0) return undefined;
    return mapCategory(result[0]);
}

export async function deleteCategory(id: number): Promise<boolean> {
    const userId = await requireUserId();

    // Unlink products before deleting to avoid FK constraint violation
    await db.update(products)
        .set({ category_id: null })
        .where(and(eq(products.category_id, id), eq(products.user_id, userId)));
    const result = await db.delete(categories)
        .where(and(eq(categories.id, id), eq(categories.user_id, userId)))
        .returning({ id: categories.id });
    return result.length > 0;
}
