// API utility functions for client-side data fetching

const API_BASE = '';

async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

async function postAPI<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

async function putAPI<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

async function deleteAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

// Products
export const productsAPI = {
    getAll: () => fetchAPI('/api/products'),
    getById: (id: number) => fetchAPI(`/api/products/${id}`),
    create: (data: unknown) => postAPI('/api/products', data),
    update: (id: number, data: unknown) => putAPI(`/api/products/${id}`, data),
    delete: (id: number) => deleteAPI(`/api/products/${id}`),
};

// Quotes
export const quotesAPI = {
    getAll: () => fetchAPI('/api/quotes'),
    getById: (id: number) => fetchAPI(`/api/quotes/${id}`),
    create: (data: unknown) => postAPI('/api/quotes', data),
    update: (id: number, data: unknown) => putAPI(`/api/quotes/${id}`, data),
    delete: (id: number) => deleteAPI(`/api/quotes/${id}`),
    convertToOrder: (id: number) => postAPI(`/api/quotes/${id}/convert`, {}),
};

// Orders
export const ordersAPI = {
    getAll: () => fetchAPI('/api/orders'),
    getById: (id: number) => fetchAPI(`/api/orders/${id}`),
    update: (id: number, data: unknown) => putAPI(`/api/orders/${id}`, data),
    delete: (id: number) => deleteAPI(`/api/orders/${id}`),
};

// Customers
export const customersAPI = {
    getAll: () => fetchAPI('/api/customers'),
    getById: (id: number) => fetchAPI(`/api/customers/${id}`),
    create: (data: unknown) => postAPI('/api/customers', data),
    update: (id: number, data: unknown) => putAPI(`/api/customers/${id}`, data),
    delete: (id: number) => deleteAPI(`/api/customers/${id}`),
};

// Categories
export const categoriesAPI = {
    getAll: () => fetchAPI('/api/categories'),
};
