import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Clock, CreditCard } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import { Order, OrderItem, Product } from '../../types/supabase';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<(OrderItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
// Вместо select('*')
const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .select(`
    *,
    shipping_info,
    payment_info
  `)
  .eq('id', id)
  .single()
          
        if (orderError) throw orderError;
        
        // Fetch order items with product details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('order_id', id);
          
        if (itemsError) throw itemsError;
        
        setOrder(orderData);
        setOrderItems(itemsData as any);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-6">
            <p>{error || 'Order not found'}</p>
          </div>
          <Link to="/orders">
            <Button variant="primary">View All Orders</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Order #{order.id.substring(0, 8)}</h2>
                <p className="text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                {order.status}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Expected delivery: 3-5 business days</span>
              </div>
              <div className="flex items-center mb-4">
                <Package className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Shipping to: {order.shipping_info.address}</span>
              </div>
              <div className="flex items-center">
                <p><CreditCard className="h-5 w-5 text-gray-400 mr-2" />
   Payment: **** **** **** {order.payment_info.card_number.slice(-4)}
</p>
<p><Package className="h-5 w-5 text-gray-400 mr-2" />
   Shipping to: {order.shipping_info.address}, {order.shipping_info.city}, {order.shipping_info.country}
</p>
                <span className="text-gray-700">Payment method: {order.payment_info.method.replace('_', ' ')}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="border rounded-md overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={item.product.image_url}
                              alt={item.product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal_price</span>
                <span className="font-medium">${(order.total_price / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${(order.total_price - order.total_price / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/orders">
              <Button variant="outline" fullWidth>
                View All Orders
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="primary" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;