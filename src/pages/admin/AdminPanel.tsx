import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, Layers, Settings } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCategories from './AdminCategories';
import AdminSettings from './AdminSettings';
import { useAdminViewStore } from '../../store/adminViewStore';

type TabType = 'products' | 'categories' | 'orders' | 'users' | 'settings';

const AdminPanel: React.FC = () => {
  const { currentView, setCurrentView } = useAdminViewStore();

  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  const tabContent = {
    products: <AdminProducts />,
    categories: <AdminCategories />,
    orders: <AdminOrders />,
    users: <AdminUsers />,
    settings: <AdminSettings />,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/5">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="divide-y">
                <button
                  onClick={() => setCurrentView('products')}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition ${
                    currentView === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <Package className="h-5 w-5 mr-3" />
                  <span>Products</span>
                </button>
                <button
                  onClick={() => setCurrentView('categories')}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition ${
                    currentView === 'categories' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <Layers className="h-5 w-5 mr-3" />
                  <span>Categories</span>
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition ${
                    currentView === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition ${
                    currentView === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition ${
                    currentView === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-4/5">
            {tabContent[currentView]}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
