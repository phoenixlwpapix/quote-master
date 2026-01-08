import { pgTable, serial, text, integer, doublePrecision, timestamp, boolean, pgSchema } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Neon Auth schema - managed by Neon (read-only reference)
export const neonAuth = pgSchema("neon_auth");

export const users = neonAuth.table("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const sessions = neonAuth.table("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
});

export const accounts = neonAuth.table("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = neonAuth.table("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// Application tables with user_id for data isolation (no FK constraint to avoid type issues)
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    created_at: timestamp('created_at').defaultNow(),
});

export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    user_id: text('user_id'), // No FK - managed at app level
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    company: text('company'),
    notes: text('notes'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    user_id: text('user_id'), // No FK - managed at app level
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    unit_price: doublePrecision('unit_price').notNull(),
    category_id: integer('category_id').references(() => categories.id),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const quotes = pgTable('quotes', {
    id: serial('id').primaryKey(),
    user_id: text('user_id'), // No FK - managed at app level
    quote_number: text('quote_number').notNull().unique(),
    customer_name: text('customer_name').notNull(),
    customer_email: text('customer_email'),
    customer_phone: text('customer_phone'),
    customer_address: text('customer_address'),
    subtotal: doublePrecision('subtotal').notNull(),
    discount_percent: doublePrecision('discount_percent').default(0).notNull(),
    discount_amount: doublePrecision('discount_amount').default(0).notNull(),
    total: doublePrecision('total').notNull(),
    notes: text('notes'),
    valid_until: text('valid_until'),
    status: text('status').default('draft'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const quoteItems = pgTable('quote_items', {
    id: serial('id').primaryKey(),
    quote_id: integer('quote_id').references(() => quotes.id, { onDelete: 'cascade' }),
    product_id: integer('product_id').references(() => products.id).notNull(),
    product_name: text('product_name').notNull(),
    product_sku: text('product_sku').notNull(),
    unit_price: doublePrecision('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    line_total: doublePrecision('line_total').notNull(),
});

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    user_id: text('user_id'), // No FK - managed at app level
    order_number: text('order_number').notNull().unique(),
    quote_id: integer('quote_id').references(() => quotes.id),
    customer_name: text('customer_name').notNull(),
    customer_email: text('customer_email'),
    customer_phone: text('customer_phone'),
    customer_address: text('customer_address'),
    subtotal: doublePrecision('subtotal').notNull(),
    discount_percent: doublePrecision('discount_percent').default(0).notNull(),
    discount_amount: doublePrecision('discount_amount').default(0).notNull(),
    total: doublePrecision('total').notNull(),
    notes: text('notes'),
    status: text('status').default('pending'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    order_id: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    product_id: integer('product_id').references(() => products.id).notNull(),
    product_name: text('product_name').notNull(),
    product_sku: text('product_sku').notNull(),
    unit_price: doublePrecision('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    line_total: doublePrecision('line_total').notNull(),
});

export const companySettings = pgTable('company_settings', {
    id: serial('id').primaryKey(),
    user_id: text('user_id'), // No FK - managed at app level
    company_name: text('company_name').notNull().default('Your Company Name'),
    company_email: text('company_email'),
    company_phone: text('company_phone'),
    company_address: text('company_address'),
    company_website: text('company_website'),
    tax_id: text('tax_id'),
    logo_url: text('logo_url'),
    footer_text: text('footer_text').default('Thank you for your business!'),
    updated_at: timestamp('updated_at').defaultNow(),
});

// Relations (app tables only)
export const productsRelations = relations(products, ({ one }) => ({
    category: one(categories, {
        fields: [products.category_id],
        references: [categories.id],
    }),
}));

export const quotesRelations = relations(quotes, ({ many }) => ({
    items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
    quote: one(quotes, {
        fields: [quoteItems.quote_id],
        references: [quotes.id],
    }),
    product: one(products, {
        fields: [quoteItems.product_id],
        references: [products.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    quote: one(quotes, {
        fields: [orders.quote_id],
        references: [quotes.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.order_id],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.product_id],
        references: [products.id],
    }),
}));
