import 'server-only';

import { db } from '../db';
import { companySettings } from '../schema';
import { eq } from 'drizzle-orm';
import type { CompanySettings, UpdateCompanySettingsInput } from '../types';
import { requireUserId } from '../auth/get-user';

function mapSettings(row: typeof companySettings.$inferSelect): CompanySettings {
    return {
        ...row,
        updated_at: row.updated_at?.toISOString() ?? new Date().toISOString(),
    };
}

export async function getCompanySettings(): Promise<CompanySettings> {
    const userId = await requireUserId();

    const result = await db.select()
        .from(companySettings)
        .where(eq(companySettings.user_id, userId));

    if (result.length === 0) {
        // Return default settings for this user
        return {
            id: 0, // Will be created on first update
            company_name: 'Your Company Name',
            company_email: null,
            company_phone: null,
            company_address: null,
            company_website: null,
            tax_id: null,
            logo_url: null,
            footer_text: 'Thank you for your business!',
            updated_at: new Date().toISOString(),
        };
    }

    return mapSettings(result[0]);
}

export async function updateCompanySettings(input: UpdateCompanySettingsInput): Promise<CompanySettings> {
    const userId = await requireUserId();

    const existing = await db.select({ id: companySettings.id })
        .from(companySettings)
        .where(eq(companySettings.user_id, userId));

    const values = {
        company_name: input.company_name,
        company_email: input.company_email,
        company_phone: input.company_phone,
        company_address: input.company_address,
        company_website: input.company_website,
        tax_id: input.tax_id,
        logo_url: input.logo_url,
        footer_text: input.footer_text,
        updated_at: new Date(),
    };

    let result: typeof companySettings.$inferSelect;
    if (existing.length === 0) {
        const [inserted] = await db.insert(companySettings).values({ user_id: userId, ...values }).returning();
        result = inserted;
    } else {
        const [updated] = await db.update(companySettings).set(values)
            .where(eq(companySettings.user_id, userId))
            .returning();
        result = updated;
    }

    return mapSettings(result);
}
