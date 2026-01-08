interface StatusBadgeProps {
    status: string;
    type?: 'quote' | 'order';
}

const quoteStatusColors: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    approved: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
    expired: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const orderStatusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    completed: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function StatusBadge({ status, type = 'quote' }: StatusBadgeProps) {
    const colors = type === 'order' ? orderStatusColors : quoteStatusColors;
    const colorClass = colors[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
