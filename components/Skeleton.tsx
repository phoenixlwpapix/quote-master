'use client';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-slate-700/50 rounded ${className}`}
        />
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="card overflow-hidden">
            {/* Table Header */}
            <div className="flex gap-4 p-4 border-b border-slate-700/50">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-slate-800/50">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    );
}

export function PageHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    );
}

export function PageSkeleton({ hasCards = false }: { hasCards?: boolean }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeaderSkeleton />
            {hasCards && <CardsSkeleton />}
            <TableSkeleton />
        </div>
    );
}
