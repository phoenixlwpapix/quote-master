// Type definitions for the application

export interface Category {
    id: number;
    name: string;
    created_at: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    company: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    unit_price: number;
    category_id: number | null;
    category_name?: string;
    created_at: string;
    updated_at: string;
}

export interface QuoteItem {
    id?: number;
    quote_id?: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface Quote {
    id: number;
    quote_number: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    total: number;
    notes: string | null;
    valid_until: string | null;
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
    created_at: string;
    updated_at: string;
    items?: QuoteItem[];
}

export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface Order {
    id: number;
    order_number: string;
    quote_id: number | null;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    total: number;
    notes: string | null;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
}

// Input types for creating/updating
export type CreateCategoryInput = Pick<Category, 'name'>;
export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateQuoteInput {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    discount_percent?: number;
    notes?: string;
    valid_until?: string;
    items: Omit<QuoteItem, 'id' | 'quote_id' | 'line_total'>[];
}

export interface UpdateQuoteInput extends Partial<Omit<CreateQuoteInput, 'items'>> {
    status?: Quote['status'];
    items?: Omit<QuoteItem, 'id' | 'quote_id' | 'line_total'>[];
}

export interface UpdateOrderInput {
    status?: Order['status'];
    notes?: string;
}

export interface CompanySettings {
    id: number;
    company_name: string;
    company_email: string | null;
    company_phone: string | null;
    company_address: string | null;
    company_website: string | null;
    tax_id: string | null;
    logo_url: string | null;
    footer_text: string | null;
    updated_at: string;
}

export type UpdateCompanySettingsInput = Omit<CompanySettings, 'id' | 'updated_at'>;

// Statistics types
export interface QuoteStats {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    expired: number;
}

export interface OrderStats {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
}
