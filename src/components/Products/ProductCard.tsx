import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, PlusCircle } from 'lucide-react';
import { Product } from '../../types/supabase';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useCartStore } from '../../stores/cartStore';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = true 
}) => {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="h-full transform transition-transform hover:scale-105">
        <div className="relative pb-[75%]">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="absolute h-full w-full object-cover"
          />
          {product.stock <= 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              Out of Stock
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{product.name}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {showAddToCart && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;