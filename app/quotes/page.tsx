import { getAllQuotes } from '@/lib/models/quote';
import QuotesClient from './quotes-client';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
    // 服务端直接获取数据，无需客户端 fetch
    const quotes = await getAllQuotes();

    // 将数据传递给 Client Component 处理交互逻辑
    return <QuotesClient initialQuotes={quotes} />;
}
