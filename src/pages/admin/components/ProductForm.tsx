import React, { useEffect, useRef, useState } from 'react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { Product, Category } from '../../../types/supabase';
import { useProductFormStore } from '../../../store/productFormStore';

type ProductCreate = Omit<Product, 'id' | 'created_at' | 'category'>;
type ProductUpdate = Omit<Product, 'created_at' | 'category'> & { id: string };

interface ProductFormProps {
  initialData?: ProductUpdate;
  onSubmit: (product: ProductCreate | ProductUpdate) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  categories,
}) => {
const {
  name,
  description,
  price,
  imageUrl,
  stock,
  categoryId,
  specs,
  hasHydrated,
  setName,
  setDescription,
  setPrice,
  setImageUrl,
  setStock,
  setCategoryId,
  setSpecs,
  editSpec,
  removeSpec,
  clearForm,
} = useProductFormStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
const [tempKey, setTempKey] = useState('');
const [tempValue, setTempValue] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);
  

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;

    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setImageUrl(initialData.image_url);
      setStock(initialData.stock);
      setCategoryId(initialData.category_id ?? '');

      if (initialData.specifications && Object.keys(initialData.specifications).length > 0) {
        const parsedSpecs: Record<string, string> = {};
        Object.entries(initialData.specifications).forEach(([k, v]) => {
          parsedSpecs[k] = v != null ? String(v) : '';
        });
        setSpecs(parsedSpecs);
      } else {
        setSpecs({});
      }
    }

    initializedRef.current = true;
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (price <= 0) newErrors.price = 'Price must be > 0';
    if (!imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!categoryId) newErrors.categoryId = 'Category required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

const handleRemoveSpec = (key: string) => {
  removeSpec(key);
  if (editingKey === key) setEditingKey(null);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newSpecKey.trim() && newSpecValue.trim()) {
      const updatedSpecs = { ...specs, [newSpecKey.trim()]: newSpecValue.trim() };
      setSpecs(updatedSpecs);
      setNewSpecKey('');
      setNewSpecValue('');
    }

    if (!validate()) return;

    const parsedSpecs: Record<string, any> = {};
    Object.entries(specs).forEach(([k, v]) => {
      const num = Number(v);
      parsedSpecs[k] = !isNaN(num) && v.trim() !== '' ? num : v;
    });

    const productData: ProductCreate | ProductUpdate = initialData
      ? {
          id: initialData.id,
          name,
          description,
          price,
          image_url: imageUrl,
          stock,
          category_id: categoryId,
          specifications: parsedSpecs,
        }
      : {
          name,
          description,
          price,
          image_url: imageUrl,
          stock,
          category_id: categoryId,
          specifications: parsedSpecs,
        };

    await onSubmit(productData);
    clearForm();
  };
  if (!hasHydrated) {
  return <div className="p-6">Loading...</div>; // или null, если хочешь
}
  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input label="Product Name" type="text" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} fullWidth />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`px-3 py-2 bg-white border ${errors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm w-full`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`px-3 py-2 bg-white border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm w-full`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div>
          <Input label="Price ($)" type="number" value={price} step="0.01" onChange={(e) => setPrice(Number(e.target.value))} error={errors.price} fullWidth />
        </div>
        <div>
          <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} error={errors.stock} fullWidth />
        </div>
        <div className="md:col-span-2">
          <Input label="Image URL" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} error={errors.imageUrl} fullWidth />
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <img src={imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded border border-gray-300" />
            </div>
          )}
        </div>

<div className="md:col-span-2">
  <h4 className="font-medium text-gray-700 mb-4">Specifications</h4>

  <div className="max-h-[300px] overflow-y-auto border rounded-md p-2 mb-4">
    {Object.entries(specs).map(([key, value]) => {
      const isEditing = editingKey === key;

      return (
        <div key={key} className="flex items-center gap-2 mb-2">
          {isEditing ? (
            <>
              <input
                className="border rounded p-2 flex-1"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
              />
              <input
                className="border rounded p-2 flex-1"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
            </>
          ) : (
            <>
              <input className="border rounded p-2 flex-1" value={key} disabled />
              <input className="border rounded p-2 flex-1" value={value} disabled />
            </>
          )}

          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              if (isEditing) {
                const newKey = tempKey.trim();
                const newValue = tempValue.trim();
                if (!newKey || !newValue) return;

                const updated = { ...specs };
                delete updated[key];
                updated[newKey] = newValue;

                setSpecs(updated);
                setEditingKey('');
              } else {
                setEditingKey(key);
                setTempKey(key);
                setTempValue(value);
              }
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>

          <button
            type="button"
            onClick={() => {
              const updated = { ...specs };
              delete updated[key];
              setSpecs(updated);
            }}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      );
    })}
  </div>

  <div className="flex items-end">
    <div className="flex-1 mr-2">
      <Input label="Specification Name" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} fullWidth />
    </div>
    <div className="flex-1 mr-2">
      <Input label="Value" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} fullWidth />
    </div>
    <button
      type="button"
      onClick={() => {
        const key = newSpecKey.trim();
        const val = newSpecValue.trim();
        if (!key || !val) return;

        setSpecs({
          ...specs,
          [key]: val,
        });

        setNewSpecKey('');
        setNewSpecValue('');
      }}
      className="px-3 py-2 border border-gray-300 rounded-md"
    >
      Add
    </button>
  </div>
</div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
