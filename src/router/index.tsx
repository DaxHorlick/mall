import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { AccountPage } from '../pages/account/index.tsx'
import { BagPage } from '../pages/bag/index.tsx'
import { CheckoutPage } from '../pages/checkout/index.tsx'
import { CommunityPage } from '../pages/community/index.tsx'
import { ExplorePage } from '../pages/explore/index.tsx'
import { ForgotPasswordPage } from '../pages/forgot-password/index.tsx'
import { HomePage } from '../pages/home/index.tsx'
import { HowItWorksPage } from '../pages/how-it-works/index.tsx'
import { LoginPage } from '../pages/login/index.tsx'
import { NotFoundPage } from '../pages/not-found/index.tsx'
import { OrderPage } from '../pages/order/index.tsx'
import { ProductPage } from '../pages/product/index.tsx'
import { RegisterPage } from '../pages/register/index.tsx'
import { ResetPasswordPage } from '../pages/reset-password/index.tsx'
import { StudioSubmittedPage } from '../pages/studio-submitted/index.tsx'
import { StudioPage } from '../pages/studio/index.tsx'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/products/:slug', element: <ProductPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/bag', element: <BagPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order', element: <OrderPage /> },
      { path: '/studio', element: <StudioPage /> },
      { path: '/studio/submitted', element: <StudioSubmittedPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
