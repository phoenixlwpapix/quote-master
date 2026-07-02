import { NextResponse } from 'next/server';
import { getCompanySettings, updateCompanySettings } from '@/lib/models/settings';
import { handleApiError, optionalString, requiredString } from '@/lib/route-helpers';

export async function GET() {
    try {
        const settings = await getCompanySettings();
        return NextResponse.json(settings);
    } catch (error) {
        return handleApiError(error, 'Failed to fetch settings');
    }
}

export async function PUT(request: Request) {
    try {
        const body: Record<string, unknown> = await request.json();
        const supportedCurrencies = new Set(['EUR', 'USD', 'CNY']);
        const currency = typeof body.currency === 'string' && supportedCurrencies.has(body.currency)
            ? body.currency
            : 'EUR';

        const settings = await updateCompanySettings({
            company_name: requiredString(body.company_name, 'Company name'),
            company_email: optionalString(body.company_email),
            company_phone: optionalString(body.company_phone),
            company_address: optionalString(body.company_address),
            company_website: optionalString(body.company_website),
            tax_id: optionalString(body.tax_id),
            logo_url: optionalString(body.logo_url),
            footer_text: optionalString(body.footer_text),
            currency,
        });

        return NextResponse.json(settings);
    } catch (error) {
        return handleApiError(error, 'Failed to update settings');
    }
}
