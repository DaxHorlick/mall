import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { DesignerPage } from '../modules/designer/pages/DesignerPage.tsx'
import { AccountPage } from '../pages/account/index.tsx'
import { AddressFormPage } from '../pages/account/address-form.tsx'
import { AddressesPage } from '../pages/account/addresses.tsx'
import { EditProfilePage } from '../pages/account/edit.tsx'
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
import { PeoplePage } from '../pages/user/people.tsx'
import { SearchPage } from '../pages/user/search.tsx'
import { UserPage } from '../pages/user/index.tsx'

export const router = createBrowserRouter([
  { path: '/designer', element: <DesignerPage /> },
  { path: '/designer/:designId', element: <DesignerPage /> },
  { path: '/studio', element: <Navigate to="/designer" replace /> },
  { path: '/studio/submitted', element: <Navigate to="/designer" replace /> },
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
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/profile', element: <AccountPage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/profile/addresses', element: <AddressesPage /> },
      { path: '/profile/addresses/new', element: <AddressFormPage /> },
      { path: '/profile/addresses/:addressId', element: <AddressFormPage /> },
      { path: '/profile/following', element: <PeoplePage /> },
      { path: '/profile/followers', element: <PeoplePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/users/:userId', element: <UserPage /> },
      { path: '/users/:userId/following', element: <PeoplePage /> },
      { path: '/users/:userId/followers', element: <PeoplePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
