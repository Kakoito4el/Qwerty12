import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types/supabase';
import { useCategoryModalStore } from '../../store/categoryModalStore';
import { useModalStore } from '../../store/useModalStore';

interface CategoryFormData {
  id?: string;
  name: string;
  description: string;
  image_url: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  // Используем хранилища Zustand
  const {
    isAddModalOpen,
    isEditModalOpen,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal
  } = useModalStore();

  const {
    name,
    description,
    imageUrl,
    setField,
    reset
  } = useCategoryModalStore();

  const allSelected = categories.length > 0 && selectedIds.length === categories.length;

  const selectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categories.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setCategories(filtered);
    } else {
      fetchCategories();
    }
  };

  const handleAdd = () => {
    reset();
    setErrors({});
    setCurrentCategory(null);
    openAddModal();
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setField('name', category.name);
    setField('description', category.description || '');
    setField('imageUrl', category.image_url || '');
    setErrors({});
    openEditModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (!userData?.is_admin) throw new Error('Admin privileges required');

      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category_id', id);

      if (count && count > 0) {
        alert('Cannot delete category with products. Please move or delete products first.');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setCategories(categories.filter(category => category.id !== id));
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setField(name as 'name' | 'description' | 'imageUrl', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = {
        name,
        description,
        image_url: imageUrl
      };

      if (currentCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', currentCategory.id);
        if (error) throw error;

        setCategories(categories.map(c =>
          c.id === currentCategory.id ? { ...c, ...formData } : c
        ));

        closeEditModal();
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([formData])
          .select();
        if (error) throw error;

        setCategories([...categories, data[0]]);
        closeAddModal();
      }
      
      reset();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} categories?`)) return;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (!userData?.is_admin) throw new Error('Admin privileges required');

      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .in('category_id', selectedIds);
      if (count && count > 0) {
        alert('Cannot delete categories with products. Please move or delete products first.');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;

      fetchCategories();
      setSelectedIds([]);
    } catch (err) {
      console.error('Error during bulk delete:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Bulk Actions Banner */}
        <div
          className={`
            absolute inset-x-6 -top-2 z-10 bg-blue-50 border border-blue-200
            rounded-md px-4 py-3 shadow transition-all duration-300
            ${selectedIds.length > 0
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-900">
              {selectedIds.length} categor{selectedIds.length > 1 ? 'ies' : 'y'} selected
            </span>
            <div className="flex gap-2">
              <Button onClick={() => setBulkEditOpen(true)}>Bulk Edit</Button>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
              >
                Bulk Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                Categories Management
              </h2>
              <Button
                variant="primary"
                onClick={handleAdd}
                className="flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                fullWidth
              />
              <Button type="submit" variant="outline">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Table or Loading */}
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
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={selectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(category.id)}
                            onChange={() => toggleSelect(category.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {category.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category.image_url ? (
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={category.image_url}
                              alt={category.name}
                            />
                          ) : (
                            <span className="text-sm text-gray-500">
                              No image
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Modal */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">
                    {isAddModalOpen ? 'Add New Category' : 'Edit Category'}
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <Input
                      label="Category Name"
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleFormChange}
                      error={errors.name}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={description}
                      onChange={handleFormChange}
                      rows={3}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Image URL"
                      type="text"
                      name="imageUrl"
                      value={imageUrl}
                      onChange={handleFormChange}
                      fullWidth
                    />
                    {imageUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (isAddModalOpen) closeAddModal();
                        else closeEditModal();
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      {isAddModalOpen ? 'Create Category' : 'Update Category'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCategories;