// src/pages/admin/AdminOrders.tsx
import React, { useEffect, useState } from 'react';
import { Eye, Search, RefreshCw, X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Order, OrderItem, Product, User } from '../../types/supabase';



type OrderWithDetails = Order & {
  user: User;
  items: (OrderItem & { product: Product })[];
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
const { data, error } = await supabase
  .from('orders')
  .select(`
    id,
    created_at,
    status,
    total_price,
    shipping_info,
    payment_info,
    users:users!orders_user_id_fkey (
      id,
      email,
      first_name,
      last_name,
      created_at,
      is_admin
    )
  `)
  .order('created_at', { ascending: false });
      if (error) throw error;

      const summary = data as unknown as OrderWithDetails[];

const mapped: OrderWithDetails[] = summary.map((o) => ({
  id: o.id,
  user_id: o.user?.id || '',
  user: o.user || {
    id: '',
    email: 'Unknown',
    first_name: '',
    last_name: '',
    created_at: '',
    is_admin: false,
  },
  created_at: o.created_at,
  updated_at: o.created_at,
  status: o.status,
  total_price: o.total_price,
  shipping_info: o.shipping_info || {
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  payment_info: o.payment_info || {
    method: '',
    card_number: '',
    cardholder: '',
    expiry: '',
    cvv: '',
  },
  items: o.items || [],
}));
      console.log('Fetched summary orders:', summary);
      setOrders(mapped);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewOrder = async (order: OrderWithDetails) => {
    setLoading(true);
    try {
const { data: items, error: itemsError } = await supabase
  .from('order_items')
  .select(`*, product:products(*)`)
  .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      const { data: fullOrder, error: ordErr } = await supabase
        .from('orders')
        .select(`shipping_info, payment_info`)
        .eq('id', order.id)
        .single();

      if (ordErr) throw ordErr;

      setCurrentOrder({
        ...order,
        items: items || [],
        shipping_info: fullOrder.shipping_info,
        payment_info: fullOrder.payment_info
      });
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder({ ...currentOrder, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsViewModalOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
            Orders Management
          </h2>
          <Button variant="outline" onClick={fetchOrders} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2 flex gap-2">
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="outline">
              <Search className="h-5 w-5" />
            </Button>
          </form>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm w-full"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View order details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {isViewModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close modal">
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-semibold mb-4">Order Details #{currentOrder.id}</h3>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Items</h4>
              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.product?.name || 'Unknown'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">${item.product?.price.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                        ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right font-semibold text-lg">
                Total: ${currentOrder.total_price.toFixed(2)}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Shipping Info</h4>
              <p><strong>Address:</strong> {currentOrder.shipping_info?.address || 'N/A'}</p>
              <p><strong>City:</strong> {currentOrder.shipping_info?.city || 'N/A'}</p>
              <p><strong>Postal Code:</strong> {currentOrder.shipping_info?.zip || 'N/A'}</p>
              <p><strong>Country:</strong> {currentOrder.shipping_info?.country || 'N/A'}</p>
            </div>

            {/* Payment Info */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Payment Info</h4>
              <p><strong>Method:</strong> {currentOrder.payment_info?.method || 'N/A'}</p>
              <p><strong>Status:</strong> {currentOrder.status || 'N/A'}</p>
              <p><strong>Transaction ID:</strong> {currentOrder.payment_info?.card_number || 'N/A'}</p>
            </div>

            {/* Status Management */}
            <div className="flex gap-2 flex-wrap">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    disabled={currentOrder.status === status}
                    onClick={() => handleUpdateStatus(currentOrder.id, status)}
                    className={`px-3 py-1 rounded-md text-white ${
                      currentOrder.status === status
                        ? 'bg-gray-400 cursor-not-allowed'
                        : status === 'pending'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : status === 'processing'
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : status === 'shipped'
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : status === 'delivered'
                        ? 'bg-green-500 hover:bg-green-600'
                        : status === 'cancelled'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-500'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
