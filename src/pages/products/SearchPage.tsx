import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import ProductGrid from '../../components/Products/ProductGrid';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/supabase';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .order('name');
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('q', searchQuery);
      window.history.pushState(
        {}, 
        '', 
        `${location.pathname}?${newSearchParams.toString()}`
      );
      // Refresh products based on new query
      const newQuery = searchQuery;
      setLoading(true);
      supabase
        .from('products')
        .select('*')
        .ilike('name', `%${newQuery}%`)
        .order('name')
        .then(({ data, error }) => {
          if (error) {
            console.error('Error searching products:', error);
          } else {
            setProducts(data || []);
          }
          setLoading(false);
        });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products">
          <Button variant="outline" className="mb-6 flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            All Products
          </Button>
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {query ? `Search Results for "${query}"` : 'Search Products'}
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                className="rounded-r-none"
              />
              <Button
                type="submit"
                variant="primary"
                className="rounded-l-none"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : query ? (
          products.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">Found {products.length} results for "{query}"</p>
              <ProductGrid products={products} />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any products matching "{query}". Try using different keywords or browse our categories.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/products">
                  <Button variant="primary">Browse All Products</Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline">View Categories</Button>
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a search term</h3>
            <p className="text-gray-600 mb-4">Type in the search box above to find products.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;