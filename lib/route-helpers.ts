import { NextResponse } from 'next/server';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function jsonError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown, fallback: string) {
    const message = errorMessage(error);
    console.error(fallback, error);

    if (error instanceof ValidationError) {
        return jsonError(message, 400);
    }

    if (message === 'User not authenticated') {
        return jsonError('Unauthorized', 401);
    }

    if (message.startsWith('Can only')) {
        return jsonError(message, 400);
    }

    if (message.includes('not found')) {
        return jsonError(message, 404);
    }

    if (message.includes('duplicate key') || message.includes('UNIQUE constraint failed')) {
        return jsonError('A record with these values already exists', 409);
    }

    return jsonError(fallback, 500);
}

export function requiredString(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ValidationError(`${field} is required`);
    }

    return value.trim();
}

export function optionalString(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

export function optionalDateString(value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        throw new ValidationError('Invalid date');
    }
    return value;
}

export function numberFrom(value: unknown, field: string, options: { min?: number; max?: number } = {}): number {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number)) {
        throw new ValidationError(`${field} must be a valid number`);
    }
    if (options.min !== undefined && number < options.min) {
        throw new ValidationError(`${field} must be at least ${options.min}`);
    }
    if (options.max !== undefined && number > options.max) {
        throw new ValidationError(`${field} must be at most ${options.max}`);
    }
    return number;
}

export function integerFrom(value: unknown, field: string, options: { min?: number; max?: number } = {}): number {
    const number = numberFrom(value, field, options);
    if (!Number.isInteger(number)) {
        throw new ValidationError(`${field} must be an integer`);
    }
    return number;
}
