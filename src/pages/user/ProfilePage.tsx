import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mr-6">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.email}
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                  <p>Profile updated successfully!</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      fullWidth
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      fullWidth
                    />
                  </div>
                  
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    disabled
                    fullWidth
                    className="bg-gray-50"
                  />
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;