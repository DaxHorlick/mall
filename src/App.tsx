import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ApiError } from './api/client.ts'
import { useLocale } from './i18n/locale.ts'
import { router } from './router/index.tsx'

export default function App() {
  // 当前是中文还是英文，按钮和提示都跟着这份文案走。

  const locale = useLocale((state) => state.locale)

  // 接口结果先放在内存里，同一份数据短时间内不重复请求。

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

  // 语言和按钮样式包在外面，里面按网址显示对应页面。

  return (
    <QueryClientProvider client={queryClient}>
      <StyleProvider layer>
        <ConfigProvider
          locale={locale === 'zh' ? zhCN : enUS}
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
