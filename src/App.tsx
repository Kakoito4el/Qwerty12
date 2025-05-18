import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CategoriesPage from './pages/products/CategoriesPage';
import CategoryPage from './pages/products/CategoryPage';
import SearchPage from './pages/products/SearchPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrderConfirmationPage from './pages/cart/OrderConfirmationPage';
import ProfilePage from './pages/user/ProfilePage';
import OrdersPage from './pages/user/OrdersPage';
import PCBuilderPage from './pages/pcbuilder/PCBuilderPage';
import ComponentSelectPage from './pages/pcbuilder/ComponentSelectPage';
import AdminPanel from './pages/admin/AdminPanel';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading, isAdmin, error } = useAuth();
  const location = useLocation();

  // Проверка ошибок
  if (error) {
    console.error('Auth error:', error);
    return <Navigate to="/login" state={{ from: location, error }} replace />;
  }

  // Проверка загрузки
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!user) {
    // Сохраняем текущий путь
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка прав администратора
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/pc-builder" element={<PCBuilderPage />} />
      <Route path="/pc-builder/select/:componentType" element={<ComponentSelectPage />} />

      {/* Protected Routes */}
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      <Route path="/orders/:id/confirmation" element={
        <ProtectedRoute>
          <OrderConfirmationPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requireAdmin>
          <AdminPanel />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
