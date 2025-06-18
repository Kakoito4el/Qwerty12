import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, PlusCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/supabase';
import { usePCBuilderStore, ComponentType } from '../../stores/pcBuilderStore';

// Map component types to likely category names (this would come from your database in a real app)
const componentCategoryMap: Record<ComponentType, string[]> = {
  cpu: ['cpu', 'processor'],
  motherboard: ['motherboard'],
  gpu: ['gpu', 'graphics card'],
  ram: ['ram', 'memory'],
  storage: ['storage', 'ssd', 'hdd'],
  psu: ['psu', 'power supply'],
  case: ['case', 'computer case'],
  cooling: ['cooling', 'cpu cooler']
};

const ComponentSelectPage: React.FC = () => {
  const { componentType } = useParams<{ componentType: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>({ min: 0, max: null });
  const [showFilters, setShowFilters] = useState(false);
  
  const { addComponent } = usePCBuilderStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!componentType || !Object.keys(componentCategoryMap).includes(componentType)) {
        navigate('/pc-builder');
        return;
      }
      
      setLoading(true);
      
      try {
        let query = supabase
          .from('products')
          .select('*');
        
const categoryIdMap: Record<ComponentType, string> = {
  cpu: '4ae152c5-c1b5-4b91-a87d-873dec685ec2',
  motherboard: '6d14af22-d79a-44fa-a3c6-295c365dd02c',
  gpu: '2febcbae-0ef2-4809-a6a0-5fcb5e41f748',
  ram: '7599425b-c362-439d-abd0-8681082b3064',
  storage: 'fd48a532-b634-4fbf-9c14-0cd59cf4bb3c',
  psu: '9c7d328d-b2eb-4498-95ff-69b88084d42d',
  case: 'c79e71ff-ce88-452a-9ddc-b652f9f33b33',
  cooling: 'd4cba72d-cb91-4176-be60-115239e427cb'
};

const categoryId = categoryIdMap[componentType as ComponentType];
if (!categoryId) {
  console.error('No categoryId found for componentType:', componentType);
  setProducts([]);
  setLoading(false);
  return;
}

query = query.eq('category_id', categoryId);
        
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
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [componentType, navigate, priceRange, sortBy, searchQuery]);

  const handleSelectComponent = (product: Product) => {
    if (!componentType) return;
    console.log('🧱 Выбран компонент:', product);
    addComponent(componentType as ComponentType, product);
    navigate('/pc-builder');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setPriceRange({ min: 0, max: null });
    setSearchQuery('');
    setSortBy('price-asc');
  };

  const getComponentTypeLabel = () => {
    if (!componentType) return 'Component';
    
    const typeMap: Record<string, string> = {
      cpu: 'Processor (CPU)',
      motherboard: 'Motherboard',
      gpu: 'Graphics Card (GPU)',
      ram: 'Memory (RAM)',
      storage: 'Storage (SSD/HDD)',
      psu: 'Power Supply (PSU)',
      case: 'Case',
      cooling: 'CPU Cooler'
    };
    
    return typeMap[componentType] || componentType;
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/pc-builder">
          <Button variant="outline" className="mb-6 flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to PC Builder
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select a {getComponentTypeLabel()}
        </h1>
        <p className="text-gray-600 mb-8">
          Choose a {getComponentTypeLabel().toLowerCase()} that fits your needs and budget.
        </p>
        
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
                <Input
                  type="text"
                  placeholder={`Search ${getComponentTypeLabel()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
              </form>
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
                    id="sort-price-asc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'price-asc'}
                    onChange={() => setSortBy('price-asc')}
                  />
                  <label htmlFor="sort-price-asc" className="ml-2 text-gray-700">
                    Price: Low to High
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
                  <label htmlFor="sort-price-desc" className="ml-2 text-gray-700">
                    Price: High to Low
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sort-name-asc"
                    name="sort"
                    className="h-4 w-4 text-blue-600"
                    checked={sortBy === 'name-asc'}
                    onChange={() => setSortBy('name-asc')}
                  />
                  <label htmlFor="sort-name-asc" className="ml-2 text-gray-700">
                    Name: A to Z
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
          
          {/* Components Grid - Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {products.length} {products.length === 1 ? 'result' : 'results'}
                  </p>
                </div>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSelectComponent(product)}
                              className="flex items-center"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
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

export default ComponentSelectPage;