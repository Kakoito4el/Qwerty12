import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import ProductGrid from '../components/Products/ProductGrid';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/supabase';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch featured products (latest 8 products)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      
      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        
        .limit(6);
      
      setFeaturedProducts(products || []);
      setCategories(cats || []);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Build Your Dream PC
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                High-quality components and expert assembly services to help you create the perfect custom PC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" variant="secondary">
                    Shop Components
                  </Button>
                </Link>
                <Link to="/pc-builder">
                  <Button size="lg" variant="outline" className="bg-white">
                    PC Builder
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg" 
                alt="Gaming PC" 
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 flex items-center transition">
              <span>View All</span>
              <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="group"
              >
                <div className="relative rounded-lg overflow-hidden h-48 bg-gray-200">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Cpu className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PC Builder Promo */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Build Your Custom PC</h2>
              <p className="text-lg mb-6 text-gray-300">
                Our PC Builder tool helps you create the perfect computer for your needs. Choose compatible components with ease and get expert recommendations.
              </p>
              <Link to="/pc-builder">
                <Button size="lg" variant="primary">
                  Start Building
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/3520694/pexels-photo-3520694.jpeg" 
                alt="PC Components" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;