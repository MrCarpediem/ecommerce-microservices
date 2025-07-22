
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const Profile = () => {
  const { currentUser: authUser, isAuthenticated } = useAuth();
  const { userProfile, getFullName, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState('account');


  const user = {
    username: authUser?.username || '',
    email: authUser?.email || '',
    role: authUser?.role || '',
    fullName: getFullName(),
    ...userProfile
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-1/4 bg-gray-50 p-4 border-r">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user.fullName || user.username}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <nav>
              <ul>
                <li>
                  <button
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === 'account' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('account')}
                  >
                    Account Information
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Order History
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === 'addresses' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    Addresses
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === 'security' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    Security
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left py-2 px-4 rounded ${activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Details
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Content */}
          <div className="md:w-3/4 p-6">
            {activeTab === 'account' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Order History</h3>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600">You haven't placed any orders yet.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'addresses' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Your Addresses</h3>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No addresses added yet.</p>
                  <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Add New Address
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input 
                      type="password"
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input 
                      type="password"
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input 
                      type="password"
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input 
                        type="text"
                        defaultValue={userProfile?.firstName || ''}
                        className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input 
                        type="text"
                        defaultValue={userProfile?.lastName || ''}
                        className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input 
                      type="tel"
                      defaultValue={userProfile?.phone || ''}
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <button 
                      type="button" 
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                      onClick={(e) => {
                        e.preventDefault();
                        // Here you would gather the form data and call updateProfile
                      }}
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
