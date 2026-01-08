import { getQuoteById } from '@/lib/models/quote';
import { notFound } from 'next/navigation';
import QuoteDetailClient from './quote-detail-client';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: Props) {
    const { id } = await params;
    const quote = await getQuoteById(Number(id));

    // 使用 Next.js 内置的 404 处理
    if (!quote) {
        notFound();
    }

    // 将预获取的数据传递给 Client Component
    return <QuoteDetailClient quote={quote} />;
}
