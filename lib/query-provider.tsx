'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // 数据被认为是新鲜的时间（5分钟）
                        staleTime: 5 * 60 * 1000,
                        // 缓存数据保留的时间（30分钟）
                        gcTime: 30 * 60 * 1000,
                        // 窗口重新聚焦时不自动重新获取
                        refetchOnWindowFocus: false,
                        // 重新连接网络时不自动重新获取
                        refetchOnReconnect: false,
                        // 重试次数
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
