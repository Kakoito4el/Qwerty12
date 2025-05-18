import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/supabase';
import ProductForm from './components/ProductForm';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  // Вставь вверху, рядом с useState и т.п.
const uniqueById = (arr: Product[]) => {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

  // Persist selection in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin:selectedIds');
    if (saved) setSelectedIds(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('admin:selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds]);


  // Fetch data on mount and when sorting changes
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [sortField, sortDirection]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(80) 
        .order(sortField, { ascending: sortDirection === 'asc' });
      if (error) throw error;
      setProducts(uniqueById(data || []));
      // do not clear selectedIds here to preserve selection
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(80) 
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchProducts();
    supabase
      .from('products')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order(sortField, { ascending: sortDirection === 'asc' })
      .then(({ data, error }) => {
        if (error) console.error('Error searching products:', error);
        else setProducts(data || []);
      });
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleAddSubmit = async (product: Omit<Product, 'id' | 'created_at'> & { id?: string }) => {
    try {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (error) throw error;
      fetchProducts(); // вместо setProducts(prev => [...prev, data![0]])
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleEditSubmit = async (product: Omit<Product, 'id' | 'created_at'> & { id?: string }) => {
    if (!product.id) {
      console.error('Product id is required for editing.');
      return;
    }
    try {
      const { error } = await supabase.from('products').update(product).eq('id', product.id);
      if (error) throw error;
      fetchProducts(); // вместо setProducts(prev => ...)
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Unknown';
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const selectAll = () => {
    setSelectedIds(prev => (prev.length === products.length ? [] : products.map(p => p.id)));
  };

  return (
    <>
      {/* Bulk Actions Banner above header */}
<div className="relative">
  <div
    className={`
      absolute left-6 right-6 top-0 z-10 bg-blue-50 border border-blue-200 
      rounded-md px-4 py-3 shadow transition-all duration-300 
      ${selectedIds.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
    `}
  >
    <div className="flex items-center justify-between">
      <span className="font-medium text-blue-900">
        {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-2">
        <Button onClick={() => console.log('TODO: Bulk Edit')}>Bulk Edit</Button>
        <Button
          variant="danger"
          onClick={async () => {
            if (!confirm(`Delete ${selectedIds.length} products?`)) return;
            await Promise.all(
              selectedIds.map(id => supabase.from('products').delete().eq('id', id))
            );
            fetchProducts();
          }}
        >
          Bulk Delete
        </Button>
      </div>
    </div>
  </div>
</div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header & actions */}
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Products Management</h2>
          <Button variant="primary" onClick={handleAdd} className="flex items-center">
            <Plus className="h-5 w-5 mr-1" /> Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="outline">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input type="checkbox" checked={allSelected} onChange={selectAll} />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name{' '}
                      {sortField === 'name' &&
                        (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category_id')}
                  >
                    <div className="flex items-center">
                      Category{' '}
                      {sortField === 'category_id' &&
                        (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price{' '}
                      {sortField === 'price' &&
                        (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      Stock{' '}
                      {sortField === 'stock' &&
                        (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-full object-cover" />
                      <span className="ml-4 text-sm font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getCategoryName(product.category_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              </div>
              <ProductForm onSubmit={handleAddSubmit} onCancel={() => setIsAddModalOpen(false)} categories={categories} />
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditModalOpen && currentProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              </div>
              <ProductForm initialData={currentProduct} onSubmit={handleEditSubmit} onCancel={() => setIsEditModalOpen(false)} categories={categories} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProducts;
