'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, quotesAPI, ordersAPI, customersAPI, categoriesAPI } from '@/lib/api';
import type { Product, Quote, Order, Customer, Category } from '@/lib/types';

// Query Keys
export const queryKeys = {
    products: ['products'] as const,
    product: (id: number) => ['products', id] as const,
    quotes: ['quotes'] as const,
    quote: (id: number) => ['quotes', id] as const,
    orders: ['orders'] as const,
    order: (id: number) => ['orders', id] as const,
    customers: ['customers'] as const,
    customer: (id: number) => ['customers', id] as const,
    categories: ['categories'] as const,
};

// Products Hooks
export function useProducts(initialData?: Product[]) {
    return useQuery({
        queryKey: queryKeys.products,
        queryFn: () => productsAPI.getAll() as Promise<Product[]>,
        initialData,
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: queryKeys.product(id),
        queryFn: () => productsAPI.getById(id) as Promise<Product>,
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: unknown }) => productsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products });
            queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products });
        },
    });
}

// Quotes Hooks
export function useQuotes(initialData?: Quote[]) {
    return useQuery({
        queryKey: queryKeys.quotes,
        queryFn: () => quotesAPI.getAll() as Promise<Quote[]>,
        initialData,
    });
}

export function useQuote(id: number) {
    return useQuery({
        queryKey: queryKeys.quote(id),
        queryFn: () => quotesAPI.getById(id) as Promise<{ quote: Quote }>,
        enabled: !!id,
    });
}

export function useCreateQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: quotesAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quotes });
        },
    });
}

export function useUpdateQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: unknown }) => quotesAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quotes });
            queryClient.invalidateQueries({ queryKey: queryKeys.quote(id) });
        },
    });
}

export function useDeleteQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: quotesAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quotes });
        },
    });
}

export function useConvertQuoteToOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: quotesAPI.convertToOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quotes });
            queryClient.invalidateQueries({ queryKey: queryKeys.orders });
        },
    });
}

// Orders Hooks
export function useOrders(initialData?: Order[]) {
    return useQuery({
        queryKey: queryKeys.orders,
        queryFn: () => ordersAPI.getAll() as Promise<Order[]>,
        initialData,
    });
}

export function useOrder(id: number) {
    return useQuery({
        queryKey: queryKeys.order(id),
        queryFn: () => ordersAPI.getById(id) as Promise<{ order: Order }>,
        enabled: !!id,
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: unknown }) => ordersAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders });
            queryClient.invalidateQueries({ queryKey: queryKeys.order(id) });
        },
    });
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders });
        },
    });
}

// Customers Hooks
export function useCustomers(initialData?: Customer[]) {
    return useQuery({
        queryKey: queryKeys.customers,
        queryFn: () => customersAPI.getAll() as Promise<Customer[]>,
        initialData,
    });
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: queryKeys.customer(id),
        queryFn: () => customersAPI.getById(id) as Promise<Customer>,
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customersAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: unknown }) => customersAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers });
            queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customersAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers });
        },
    });
}

// Categories Hooks
export function useCategories(initialData?: Category[]) {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: () => categoriesAPI.getAll() as Promise<Category[]>,
        initialData,
    });
}
