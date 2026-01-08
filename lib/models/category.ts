import { db } from '../db';
import { categories } from '../schema';
import { eq, asc } from 'drizzle-orm';
import type { Category, CreateCategoryInput } from '../types';

function mapCategory(c: typeof categories.$inferSelect): Category {
    return {
        ...c,
        created_at: c.created_at?.toISOString() ?? new Date().toISOString(),
    };
}

export async function getAllCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(asc(categories.name));
    return result.map(mapCategory);
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    if (result.length === 0) return undefined;
    return mapCategory(result[0]);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
    const result = await db.insert(categories).values({
        name: input.name,
    }).returning();

    return mapCategory(result[0]);
}

export async function deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return result.length > 0;
}
