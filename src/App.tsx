import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ApiError } from './api/client.ts'
import { router } from './router/index.tsx'

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: (failureCount, error) => {
              if (
                error instanceof ApiError &&
                (error.status === 400 ||
                  error.status === 401 ||
                  error.status === 403 ||
                  error.status === 404 ||
                  error.status === 409 ||
                  error.status === 429)
              ) {
                return false
              }
              return failureCount < 1
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#17181b',
              borderRadius: 10,
              fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
            },
          }}
        >
          <AntdApp>
            <RouterProvider router={router} />
          </AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </QueryClientProvider>
  )
}
