import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Star, TruckIcon, ShieldCheck, Award } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/supabase';
import { useCartStore } from '../../stores/cartStore';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

useEffect(() => {
  const fetchProduct = async () => {
    if (!id) return;

    try {
const { data, error } = await supabase
  .from('products')
  .select(`
    id,
    name,
    description,
    price,
    image_url,
    stock,
    specifications,
    created_at,
    category_id,
    category:categories (
      id,
      name,
      description,
      image_url,
      created_at
    )
  `)
  .eq('id', id)
  .single();

      if (error) throw error;

      setProduct({
  ...data,
  category: Array.isArray(data.category) ? data.category[0] : data.category
});
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/products')}
            >
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const specs = product.specifications || {};

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="max-w-full h-auto rounded-lg object-contain max-h-96"
              />
            </div>
            
            {/* Product Details */}
            <div>
              {/* Category */}
              <div className="mb-2">
                <span className="text-sm text-blue-600">
                  {product.category?.name || 'Computer Component'}
                </span>
              </div>
              
              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(24 reviews)</span>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.stock > 0 ? (
                  <span className="ml-4 text-sm text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="ml-4 text-sm text-red-600">Out of Stock</span>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <div className="flex">
                      <button 
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="px-3 py-2 border border-gray-300 rounded-l-md"
                        disabled={product.stock <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-16 border-t border-b border-gray-300 text-center py-2"
                        disabled={product.stock <= 0}
                      />
                      <button 
                        onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                        className="px-3 py-2 border border-gray-300 rounded-r-md"
                        disabled={product.stock <= 0}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </Button>
              </div>
              
              {/* Features */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Free shipping</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">2-year warranty</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Premium quality</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Specifications */}
          <div className="border-t p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(specs).length > 0 ? (
                Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex border-b pb-3">
                    <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-gray-600">
                  No detailed specifications available for this product.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;