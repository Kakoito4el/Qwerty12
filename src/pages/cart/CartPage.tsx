import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ChevronLeft, Eye } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import { useCartStore } from '../../stores/cartStore';
import { useAuth } from '../../contexts/AuthContext';
import { handleCheckout } from '../../lib/handleCheckout'; // ✅ импорт нужной функции


const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);
  

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    updateQuantity(productId, quantity);
  };


const onCheckoutClick = async () => {
  if (!user) {
    navigate('/login', { state: { from: '/cart' } });
    return;
  }

  console.log('🟡 Вызываем handleCheckout с:', {
    userId: user.id,
    items,
  });

  try {
    const orderId = await handleCheckout(user.id, items);
    console.log('✅ Заказ успешно создан, ID:', orderId);
    clearCart();
    navigate(`/order-success/${orderId}`);
  } catch (error) {
    console.error('❌ Ошибка при оформлении заказа:', error);
    alert('Произошла ошибка при оформлении заказа. Попробуйте позже.');
  }
};

  useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'auto';
  };
}, []);
return (
  <Layout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-1">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some products to your cart and come back here to check out.</p>
          <Link to="/products">
            <Button variant="primary">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.isBuild ? `build-${item.id}` : `product-${item.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              className="h-full w-full object-cover"
                              src={item?.image_url || 'https://images.unsplash.com/photo-1593640408182-31c228ca7b79'}
                              alt={item?.name || 'Product image'}
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/product/${item?.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {item?.name || 'Без названия'}
                            </Link>
                          </div>
                        </div>
                        {/* Состав сборки */}
{item.isBuild && Array.isArray(item.components) && item.components.length > 0 && (
  <div className="relative z-10">
    <button
      onClick={() => {
        if (expandedItem === item.id) {
          setExpandedItem(null);
          document.body.style.overflow = '';
        } else {
          setExpandedItem(item.id);
          document.body.style.overflow = 'hidden'; // блокируем фон
        }
        setExpandedComponentId(null); // сбрасываем детали
      }}
      className="flex items-center gap-1 text-blue-600 hover:underline text-sm mt-2"
    >
      <Eye className="h-4 w-4" />
      {expandedItem === item.id ? 'Скрыть состав' : 'Показать состав'}
    </button>

    {expandedItem === item.id && (
      <div className="fixed top-1/2 left-1/2 z-50 w-[600px] max-h-[400px] overflow-y-auto rounded-lg shadow-2xl border border-gray-300 bg-white transform -translate-x-1/2 -translate-y-1/2 p-6">
        <h3 className="text-lg font-bold mb-4 text-center">Состав сборки</h3>
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-800">
          {item.components.map((comp) => {
            const isLong = comp.name.length > 40;
            const isExpanded = expandedComponentId === comp.id;

            return (
              <li key={comp.id} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  {isLong && !isExpanded ? (
                    <>
                      <span className="truncate block max-w-full">{comp.name.slice(0, 40)}...</span>
                      <button
                        onClick={() => setExpandedComponentId(comp.id)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        далее
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="block">{comp.name}</span>
                      {isLong && (
                        <button
                          onClick={() => setExpandedComponentId(null)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          скрыть
                        </button>
                      )}
                    </>
                  )}
                </div>
                <span className="text-gray-600 whitespace-nowrap">{comp.price} $</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setExpandedItem(null);
              setExpandedComponentId(null);
              document.body.style.overflow = '';
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
          >
            Закрыть
          </button>
        </div>
      </div>
    )}
  </div>
)}

                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            className="p-1 border border-gray-300 rounded-l-md"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) =>
                              handleUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-12 p-1 text-center border-t border-b border-gray-300"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="p-1 border border-gray-300 rounded-r-md"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        ${(item?.price || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        ${((item?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <Link to="/products">
                <Button variant="outline">
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Continue Shopping
                </Button>
              </Link>
              <Button variant="danger" onClick={() => clearCart()}>
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getTotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(getTotal() * 0.1).toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(getTotal() * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

<Button
  variant="primary"
  fullWidth
  className="mt-6"
  onClick={onCheckoutClick}
>
  Proceed to Checkout
</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
);
}

export default CartPage;