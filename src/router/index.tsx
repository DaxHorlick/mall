import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { HomePage } from '../pages/home/index.tsx'
import { NotFoundPage } from '../pages/not-found/index.tsx'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
