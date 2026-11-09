import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { AccountPage } from '../pages/account/index.tsx'
import { LoginPage } from '../pages/login/index.tsx'
import { NotFoundPage } from '../pages/not-found/index.tsx'
import { RegisterPage } from '../pages/register/index.tsx'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: null },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
