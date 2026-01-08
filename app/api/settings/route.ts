import { NextResponse } from 'next/server';
import { getCompanySettings, updateCompanySettings } from '@/lib/models/settings';

export async function GET() {
    try {
        const settings = await getCompanySettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!body.company_name?.trim()) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }

        const settings = await updateCompanySettings({
            company_name: body.company_name,
            company_email: body.company_email || null,
            company_phone: body.company_phone || null,
            company_address: body.company_address || null,
            company_website: body.company_website || null,
            tax_id: body.tax_id || null,
            logo_url: body.logo_url || null,
            footer_text: body.footer_text || null,
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
