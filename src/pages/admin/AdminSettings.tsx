import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState('NexTech PC Components');
  const [contactEmail, setContactEmail] = useState('support@nextech.com');
  const [contactPhone, setContactPhone] = useState('(123) 456-7890');
  const [address, setAddress] = useState('1234 Tech Street, Silicon Valley, CA 94043');
  const [taxRate, setTaxRate] = useState('10');
  const [shipping, setShipping] = useState('Free');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the settings in the database
    // For this demo, we just show a success message
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Store Settings</h2>
        <p className="text-gray-600 mt-1">Configure your store settings</p>
      </div>
      
      {success && (
        <div className="m-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>Settings saved successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Store Name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              fullWidth
            />
          </div>
          
          <Input
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            fullWidth
          />
          
          <Input
            label="Contact Phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            fullWidth
          />
          
          <div className="md:col-span-2">
            <Input
              label="Store Address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
            />
          </div>
          
          <Input
            label="Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            fullWidth
          />
          
          <Input
            label="Shipping"
            type="text"
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/yourstore"
              fullWidth
            />
            
            <Input
              label="Twitter"
              type="url"
              placeholder="https://twitter.com/yourstore"
              fullWidth
            />
            
            <Input
              label="Instagram"
              type="url"
              placeholder="https://instagram.com/yourstore"
              fullWidth
            />
            
            <Input
              label="YouTube"
              type="url"
              placeholder="https://youtube.com/yourchannel"
              fullWidth
            />
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <span className="ml-2 text-gray-700">Accept Credit Cards</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <span className="ml-2 text-gray-700">Accept PayPal</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Accept Cryptocurrency</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            variant="primary"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;