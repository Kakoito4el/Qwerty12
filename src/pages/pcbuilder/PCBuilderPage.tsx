import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Cpu,Trash2, ShoppingCart } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import { usePCBuilderStore, ComponentType } from '../../stores/pcBuilderStore';
import { supabase } from '../../lib/supabase';
import { Category, Product } from '../../types/supabase';
import { useCartStore } from '../../stores/cartStore';
import { createBuildAndAddToCart } from '../../lib/createBuildAndAddToCart';

// Define component categories with their corresponding icons and descriptions
const componentCategories: { [key in ComponentType]: { label: string; icon: React.ReactNode; description: string } } = {
  cpu: { 
    label: 'Processor (CPU)', 
    icon: <Cpu className="h-5 w-5" />,
    description: 'The brain of your computer that performs calculations and executes instructions.'
  },
  motherboard: { 
    label: 'Motherboard', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>,
    description: 'The main circuit board that connects all components of your system.'
  },
  gpu: { 
    label: 'Graphics Card (GPU)', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="18" y2="12" /></svg>,
    description: 'Renders images, videos, and animations for display output.'
  },
  ram: { 
    label: 'Memory (RAM)', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19v-3"></path><path d="M10 19v-3"></path><path d="M14 19v-3"></path><path d="M18 19v-3"></path><path d="M8 11V9"></path><path d="M16 11V9"></path><path d="M12 11V9"></path><path d="M2 15h20"></path><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"></path></svg>,
    description: 'Temporary storage for data that the CPU needs to access quickly.'
  },
  storage: { 
    label: 'Storage (SSD/HDD)', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>,
    description: 'Stores all your data, programs, and operating system.'
  },
  psu: { 
    label: 'Power Supply (PSU)', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2"></path><rect x="6" y="2" width="12" height="6" rx="2"></rect></svg>,
    description: 'Supplies and regulates power to all components in the system.'
  },
  case: { 
    label: 'Case', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>,
    description: 'Houses and protects all your computer components.'
  },
  cooling: { 
    label: 'CPU Cooler', 
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v1"></path><path d="M17.4 5.6l-.7.7"></path><path d="M21 12h-1"></path><path d="M18.4 17.4l-.7-.7"></path><path d="M12 20v1"></path><path d="M6.3 17.7l-.7.7"></path><path d="M2 12h1"></path><path d="M5.6 6.6l.7.7"></path><path d="M12 12v0"></path></svg>,
    description: 'Keeps your CPU at safe operating temperatures.'
  }
};
const PCBuilderPage: React.FC = () => {
  const { build, addComponent, removeComponent, clearBuild, getBuildTotal } = usePCBuilderStore();
  const [categories, setCategories] = useState<{[key: string]: Category}>({});
  const [loading, setLoading] = useState(true);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
          
        if (error) throw error;
        
        const categoriesMap: {[key: string]: Category} = {};
        data?.forEach(category => {
          categoriesMap[category.id] = category;
        });
        
        setCategories(categoriesMap);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Check compatibility whenever the build changes
  useEffect(() => {
    const issues: string[] = [];
    
    // This is where you would implement compatibility logic
    // For example:
    if (build.cpu && build.motherboard) {
      // Check if CPU socket is compatible with motherboard
      // This is just an example - you would need real compatibility data
      // issues.push('CPU socket is not compatible with motherboard');
    }
    
    setCompatibilityIssues(issues);
  }, [build]);

  const handleAddAllToCart = () => {
    Object.values(build).forEach(product => {
      if (product) {
        addItem(product, 1);
      }
    });
    navigate('/cart');
  };

  const isComplete = Object.keys(build).length >= Object.keys(componentCategories).length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PC Builder</h1>
        <p className="text-gray-600 mb-8">
          Select components to build your custom PC. We'll help you ensure compatibility.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Component Selection */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Components</h2>
                <p className="text-gray-600">Select each component for your build</p>
              </div>
              
              <div className="divide-y">
                {Object.entries(componentCategories).map(([type, info]) => {
                  const component = build[type as ComponentType];
                  
                  return (
                    <div key={type} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 p-2 bg-blue-100 text-blue-700 rounded-full">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{info.label}</h3>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                      
                      {component ? (
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <p className="font-medium">{component.name}</p>
                            <p className="text-sm text-gray-500">${component.price.toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => removeComponent(type as ComponentType)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <Link 
                              to={`/pc-builder/select/${type}`} 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                              <PlusCircle className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Link 
                          to={`/pc-builder/select/${type}`}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <span className="mr-1">Add</span>
                          <PlusCircle className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Build Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Build Summary</h2>
              
              {Object.keys(build).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(build).map(([type, product]) => (
                    product && (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-600">{componentCategories[type as ComponentType].label}</span>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </div>
                    )
                  ))}
                  
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${getBuildTotal().toFixed(2)}</span>
                  </div>
                  
                  {compatibilityIssues.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                      <h4 className="font-medium">Compatibility Issues:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {compatibilityIssues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4 flex flex-col space-y-3">
                    <Button
                      variant="primary"
                      onClick={handleAddAllToCart}
                      disabled={Object.keys(build).length === 0 || compatibilityIssues.length > 0}
                      className="flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add All to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => clearBuild()}
                      disabled={Object.keys(build).length === 0}
                    >
                      Clear Build
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Your build is empty. Start by adding some components!</p>
                  <Link to="/pc-builder/select/cpu">
                    <Button variant="primary">
                      Start with CPU
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Build Status</h3>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      compatibilityIssues.length > 0 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(Object.keys(build).length / Object.keys(componentCategories).length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Object.keys(build).length} of {Object.keys(componentCategories).length} components selected
                </p>
              </div>
              {isComplete && (
  <div className="mt-4 flex justify-end">
    <Button
      variant="outline"
      size="sm"
onClick={async () => {
  try {
    const selectedProducts = Object.values(build).filter(Boolean) as Product[];
    await createBuildAndAddToCart(selectedProducts, addItem);
    navigate('/cart');
  } catch (err) {
    console.error('Ошибка при создании сборки:', err);
    alert('Не удалось сохранить сборку. Попробуйте позже.');
  }
}}

      className="text-xs text-green-600 hover:bg-green-100 border border-green-600"
    >
      <ShoppingCart className="h-3 w-3 mr-1" />
      Сборку в корзину
    </Button>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PCBuilderPage;