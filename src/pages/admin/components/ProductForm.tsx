import React, { useState } from 'react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { Product, Category } from '../../../types/supabase';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (product: Omit<Product, 'id' | 'created_at'> & { id?: string }) => void;
  onCancel: () => void;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  categories 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [specs, setSpecs] = useState<Record<string, string>>(() => {
    const initialSpecs = initialData?.specifications || {};
    // Convert specifications to string values for the form
    return Object.entries(initialSpecs).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  });
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs({
        ...specs,
        [newSpecKey]: newSpecValue
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpec = (key: string) => {
    const newSpecs = { ...specs };
    delete newSpecs[key];
    setSpecs(newSpecs);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }
    
    if (stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Convert specs values back to appropriate types if needed
    const parsedSpecs = Object.entries(specs).reduce((acc, [key, value]) => {
      // Try to parse as number if it looks like one
      const numValue = Number(value);
      acc[key] = !isNaN(numValue) && value.trim() !== '' ? numValue : value;
      return acc;
    }, {} as Record<string, any>);
    
    const productData = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      description,
      price,
      image_url: imageUrl,
      stock,
      category_id: categoryId,
      specifications: parsedSpecs,
      category: categories.find((category) => category.id === categoryId) || null
    };
    
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Product Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            fullWidth
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`px-3 py-2 bg-white border ${
              errors.categoryId ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm w-full`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`px-3 py-2 bg-white border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm w-full`}
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        <div>
          <Input
            label="Price ($)"
            type="number"
            value={price}
            step="0.01"
            onChange={(e) => setPrice(Number(e.target.value))}
            error={errors.price}
            fullWidth
          />
        </div>
        
        <div>
          <Input
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            error={errors.stock}
            fullWidth
          />
        </div>
        
        <div className="md:col-span-2">
          <Input
            label="Image URL"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            error={errors.imageUrl}
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
        
        <div className="md:col-span-2">
          <h4 className="font-medium text-gray-700 mb-4">Specifications</h4>
          
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex items-center mb-2">
              <div className="flex-1 mr-2">
                <Input value={key} disabled fullWidth />
              </div>
              <div className="flex-1 mr-2">
                <Input value={value} disabled fullWidth />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSpec(key)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex items-end mt-4">
            <div className="flex-1 mr-2">
              <Input
                label="Specification Name"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex-1 mr-2">
              <Input
                label="Value"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                fullWidth
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSpec}
              disabled={!newSpecKey.trim() || !newSpecValue.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;