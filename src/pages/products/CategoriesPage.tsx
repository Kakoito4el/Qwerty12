import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types/supabase';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(20) 
          .order('name');
          
        if (error) throw error;
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Categories</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="h-48 bg-gray-200 relative">
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
                  {category.description && (
                    <div className="p-4">
                      <p className="text-gray-600 line-clamp-2">{category.description}</p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage;