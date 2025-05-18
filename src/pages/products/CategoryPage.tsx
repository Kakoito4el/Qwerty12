import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import ProductGrid from '../../components/Products/ProductGrid';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/supabase';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .limit(20) 
          .eq('id', id)
          .single();
        
        if (categoryError) throw categoryError;
        
        // Fetch products in this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(20) 
          .eq('category_id', id)
          .order('name');
        
        if (productsError) throw productsError;
        
        setCategory(categoryData);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndProducts();
  }, [id]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/categories">
          <Button variant="outline" className="mb-6 flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            All Categories
          </Button>
        </Link>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : category ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
            
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products in this category</h3>
                <p className="text-gray-600 mb-4">Check back later or explore other categories.</p>
                <Link to="/categories">
                  <Button variant="primary">Browse Categories</Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Category not found</h3>
            <p className="text-gray-600 mb-4">The category you're looking for doesn't exist or has been removed.</p>
            <Link to="/categories">
              <Button variant="primary">Browse Categories</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;