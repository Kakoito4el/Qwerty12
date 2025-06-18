import React, { useEffect, useState } from 'react';
import { Filter, ArrowDown, ArrowUp } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import ProductGrid from '../../components/Products/ProductGrid';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/supabase';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>({ min: 0, max: null });
  const [sortBy, setSortBy] = useState<string>('name-asc');
  
  // Mobile filters visibility
  const [showFilters, setShowFilters] = useState(false);
  const uniqueById = (arr: Product[]) => {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (ignore) return; // защита
      setLoading(true);
      
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        setCategories(categoriesData || []);
        
        // Start building the query
        let query = supabase
          .from('products')
          .select('*');
        
        // Apply category filter
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        
        // Apply price range filter
        if (priceRange.min > 0) {
          query = query.gte('price', priceRange.min);
        }
        
        if (priceRange.max !== null) {
          query = query.lte('price', priceRange.max);
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        // Apply sorting
        const [sortField, sortDirection] = sortBy.split('-');
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
        
        const { data: productsData } = await query;
        console.log("Unique filtered:", uniqueById(productsData || []));
        setProducts(uniqueById(productsData || []));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
      return () => {
    ignore = true;
  };
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // searchQuery state is already updated, this will trigger the useEffect
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: 0, max: null });
    setSearchQuery('');
    setSortBy('name-asc');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
        
        <div className="lg:flex">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center"
            >
              <Filter className="mr-2 h-5 w-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {/* Filters - Left Sidebar */}
          <aside 
            className={`lg:w-1/4 pr-8 ${
              showFilters ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Search</h3>
              <form onSubmit={handleSearch}>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                  />
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category"
                    className="h-4 w-4 text-blue-600"
                    checked={selectedCategory === null}
                    onChange={() => setSelectedCategory(null)}
                  />
                  <label htmlFor="all-categories" className="ml-2 text-gray-700">
                    All Categories
                  </label>
                </div>
                
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.id}`}
                      name="category"
                      className="h-4 w-4 text-blue-600"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })}
                  fullWidth
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange({ 
                    ...priceRange, 
                    max: e.target.value ? Number(e.target.value) : null 
                  })}
                  fullWidth
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-name-asc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'name-asc'}
                    onChange={() => setSortBy('name-asc')}
                  />
                  <label htmlFor="sort-name-asc" className="ml-2 text-gray-700 flex items-center">
                    Name <ArrowUp className="ml-1 h-3 w-3" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-name-desc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'name-desc'}
                    onChange={() => setSortBy('name-desc')}
                  />
                  <label htmlFor="sort-name-desc" className="ml-2 text-gray-700 flex items-center">
                    Name <ArrowDown className="ml-1 h-3 w-3" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-price-asc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'price-asc'}
                    onChange={() => setSortBy('price-asc')}
                  />
                  <label htmlFor="sort-price-asc" className="ml-2 text-gray-700 flex items-center">
                    Price <ArrowUp className="ml-1 h-3 w-3" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-price-desc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'price-desc'}
                    onChange={() => setSortBy('price-desc')}
                  />
                  <label htmlFor="sort-price-desc" className="ml-2 text-gray-700 flex items-center">
                    Price <ArrowDown className="ml-1 h-3 w-3" />
                  </label>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </aside>
          
          {/* Products Grid - Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                
                <ProductGrid products={products} />
                
                {products.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;