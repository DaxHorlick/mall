import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '../components/auth/RequireAuth.tsx'
import { MainLayout } from '../layouts/MainLayout.tsx'
import { LoginPage } from '../pages/auth/login.tsx'
import { RegisterPage } from '../pages/auth/register.tsx'
import { CartPage } from '../pages/cart/index.tsx'
import { CheckoutPage } from '../pages/checkout/index.tsx'
import { CommunityPage } from '../pages/community/index.tsx'
import { PostDetailPage } from '../pages/community/detail.tsx'
import { CreatorCenterPage } from '../pages/creator/index.tsx'
import { CreatorPage } from '../pages/creators/index.tsx'
import { HomePage } from '../pages/home/index.tsx'
import { CreatePostPage } from '../pages/my-posts/create.tsx'
import { MyPostsPage } from '../pages/my-posts/index.tsx'
import { MyStorePage } from '../pages/my-store/index.tsx'
import { NotFoundPage } from '../pages/not-found/index.tsx'
import { OrderDetailPage } from '../pages/orders/detail.tsx'
import { OrdersPage } from '../pages/orders/index.tsx'
import { ProductDetailPage } from '../pages/product-detail/index.tsx'
import { ProductsPage } from '../pages/products/index.tsx'
import { ProfilePage } from '../pages/profile/index.tsx'
import { SellerOrdersPage } from '../pages/seller/orders.tsx'
import { SellerProductsPage } from '../pages/seller/products.tsx'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/community/:id', element: <PostDetailPage /> },
      { path: '/creators/:userId', element: <CreatorPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/creator', element: <CreatorCenterPage /> },
          { path: '/my-posts', element: <MyPostsPage /> },
          { path: '/my-posts/new', element: <CreatePostPage /> },
          { path: '/my-store', element: <MyStorePage /> },
          { path: '/seller/products', element: <SellerProductsPage /> },
          { path: '/seller/orders', element: <SellerOrdersPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
