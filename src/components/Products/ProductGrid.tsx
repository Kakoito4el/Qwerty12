import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../../types/supabase';

interface ProductGridProps {
  products: Product[];
  showAddToCart?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  showAddToCart = true 
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          showAddToCart={showAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;