import React, { useEffect, useState, useRef } from 'react';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/supabase';
import ProductForm from './components/ProductForm';
import { useModalStore } from '../../store/useModalStore';
import { useProductFormStore } from '../../store/productFormStore';

type ProductCreate = Omit<Product, 'id' | 'created_at' | 'category'>;
type ProductUpdate = Omit<Product, 'created_at' | 'category'> & { id: string };

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');

const {
  setName,
  setDescription,
  setPrice,
  setImageUrl,
  setStock,
  setCategoryId,
  setSpecs,      // <-- добавили
  clearForm,
} = useProductFormStore();

  const {
    isAddModalOpen,
    isEditModalOpen,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  } = useModalStore();

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const editInitRef = useRef<boolean>(false);

  
  useEffect(() => {
    const saved = localStorage.getItem('admin:selectedIds');
    if (saved) setSelectedIds(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('admin:selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [sortField, sortDirection, filterCategory]);

  // Автовосстановление Edit‐модалки: если грузили страницы во время редактирования,
  // то снова вызывем handleEdit(found), который заполнит store и откроет форму.
useEffect(() => {
  if (!loading && !editInitRef.current) {
    editInitRef.current = true;
    const shouldOpenEdit = localStorage.getItem('editModalOpen') === 'true';
    const savedId = localStorage.getItem('editProductId');
    if (shouldOpenEdit && savedId) {
      const found = products.find(p => p.id === savedId);
      if (found) {
        // Заменили просто openEditModal() на handleEdit(found)
        handleEdit(found);
      } else {
        localStorage.removeItem('editModalOpen');
        localStorage.removeItem('editProductId');
      }
    }
  }
}, [loading, products]);

  const uniqueById = (arr: Product[]) => {
    const seen = new Set<string>();
    return arr.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
.select('id, name, description, price, stock, image_url, category_id, specifications, created_at')        .order(sortField, { ascending: sortDirection === 'asc' });

      if (filterCategory) {
        query = query.eq('category_id', filterCategory);
      }

      const { data, error } = await query.limit(80);
      if (error) throw error;
      setProducts(uniqueById(data || []));
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchProducts();
    supabase
      .from('products')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .order(sortField, { ascending: sortDirection === 'asc' })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error searching products:', error);
        } else {
          setProducts(data || []);
        }
      });
  };

  const handleFilterChange = (categoryId: string) => {
    setFilterCategory(categoryId);
  };

  /**
   * ------------ Добавление (Add Product) ------------
   * 1) Очищаем store (all fields + specs) вызовом clearForm()
   * 2) Сбрасываем флаги localStorage, если они там случайно остались
   * 3) Открываем AddModal
   */
  const handleAdd = () => {
    setCurrentProduct(null);
    clearForm();
    localStorage.removeItem('editModalOpen');
    localStorage.removeItem('editProductId');
    openAddModal();
  };

  /**
   * ------------ Редактирование (Edit Product) ------------
   * 1) Заполняем store ВСЕМИ полями из product (включая specifications)
   * 2) Сохраняем флаги в localStorage
   * 3) Открываем EditModal
   */
const handleEdit = (product: Product) => {
  console.log('Перед setSpecs, product.specifications =', product.specifications);
  setCurrentProduct(product);

  setName(product.name || '');
  setDescription(product.description || '');
  setPrice(product.price);
  setImageUrl(product.image_url || '');
  setStock(product.stock);
  setCategoryId(product.category_id || '');

  // ↓ Заменили эту строку ↓
  // setSpecs(product.specifications || {}); // <-- было

  // на такой код:
  const raw = product.specifications || {};
  const parsed: Record<string, string> = {};
  Object.entries(raw).forEach(([k, v]) => {
    parsed[k] = v != null ? String(v) : '';
  });
  setSpecs(parsed);

  localStorage.setItem('editModalOpen', 'true');
  localStorage.setItem('editProductId', product.id);
  
  openEditModal();
};

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      // Проверяем авторизацию
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      // Проверяем права администратора
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (!userData?.is_admin) throw new Error('Admin privileges required');

      // Удаляем товар
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      fetchProducts();

      // Если удалили товар, который редактировали, сбрасываем флаги
      const savedId = localStorage.getItem('editProductId');
      if (savedId === id) {
        localStorage.removeItem('editModalOpen');
        localStorage.removeItem('editProductId');
        closeEditModal();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

const handleAddSubmit = async (product: ProductCreate) => {
  const productData = {
    ...product,
    specifications: product.specifications || {},
  };
  
  try {
    const { error } = await supabase.from('products').insert([productData]);
    if (error) throw error;
    await fetchProducts();
    closeAddModal();
    clearForm();
  } catch (err) {
    console.error('Error adding product:', err);
  }
};

const handleEditSubmit = async (product: ProductUpdate) => {
  const { specs } = useProductFormStore.getState();

  const productData = {
    ...product,
    specifications: specs,
  };

  // ✅ ВСТАВЬ ВОТ СЮДА
  console.log('[UPDATE] Обновляем Supabase:', productData);

  try {
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', product.id);

    if (error) throw error;

    await fetchProducts();
    closeEditModal();
    clearForm();
  } catch (err) {
    console.error('❌ Ошибка при обновлении товара:', err);
  }
};

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(prev =>
      prev.length === products.length ? [] : products.map(p => p.id)
    );
  };

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return 'Неизвестная категория';
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.name : 'Неизвестная категория';
}
  return (
    <>
      {/* Bulk Actions Banner */}
      <div className="relative">
        <div
          className={`
            absolute left-6 right-6 top-0 z-10 bg-blue-50 border border-blue-200 
            rounded-md px-4 py-3 shadow transition-all duration-300 
            ${
              selectedIds.length > 0
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }
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
                    selectedIds.map(id =>
                      supabase.from('products').delete().eq('id', id)
                    )
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
            Products Management
          </h2>
          <Button variant="primary" onClick={handleAdd} className="flex items-center">
            <Plus className="h-5 w-5 mr-1" /> Add Product
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="p-6 border-b">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
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

          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              Filter by Category:
            </label>
            <select
              value={filterCategory}
              onChange={e => handleFilterChange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">All categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {filterCategory && (
              <Button variant="outline" onClick={() => setFilterCategory('')}>
                Clear Filter
              </Button>
            )}
          </div>
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
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category_id')}
                  >
                    <div className="flex items-center">
                      Category{' '}
                      {sortField === 'category_id' && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price{' '}
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      Stock{' '}
                      {sortField === 'stock' && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      />
                      <span
                        className="
                          ml-4
                          text-sm font-medium text-gray-900
                          overflow-hidden truncate
                          max-w-[200px]
                        "
                      >
                        {product.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(product.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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
              <ProductForm
                onSubmit={async (product: ProductCreate) => {
                  await handleAddSubmit(product);
                }}
                onCancel={() => {
                  clearForm();
                  closeAddModal();
                }}
                categories={categories}
              />
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
      <ProductForm
        initialData={{
          ...currentProduct,
          specifications:
            typeof currentProduct.specifications === 'object' &&
            currentProduct.specifications !== null
              ? currentProduct.specifications
              : {},
        }}
        onSubmit={async (product: ProductCreate | ProductUpdate) => {
          if ('id' in product) {
            await handleEditSubmit(product);
          }
        }}
        onCancel={() => {
          clearForm();
          localStorage.removeItem('editModalOpen');
          localStorage.removeItem('editProductId');
          closeEditModal();
        }}
        categories={categories}
      />
    </div>
  </div>
)}
      </div>
    </>
  );
};

export default AdminProducts;


