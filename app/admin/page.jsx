'use client';

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

const ADMIN_USER_IDS = ['user_2r6nKR4A6JG1vSRXXDXWzRaSV6S']; // Same admin IDs

export default function AdminLoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  // If user is already authenticated and is an admin, redirect to contributions
  if (isLoaded && user && ADMIN_USER_IDS.includes(user.id)) {
    router.push('/admin/contributions');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // You can add your admin password here
    if (password === 'admin123') { // Change this to your secure password
      if (user && ADMIN_USER_IDS.includes(user.id)) {
        router.push('/admin/contributions');
      } else {
        setError('You do not have admin privileges');
      }
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!user && (
              <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                Please sign in with your account first
              </div>
            )}

            {user && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logged in as
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={user.profileImageUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Login as Admin
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
