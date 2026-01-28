"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, User, LogOut, Camera, Save, X, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/services/api';

export default function VendorLayout({ children }) {
  const pathname = usePathname();
  // Alias user -> currentUser to match existing code
  const { logout, user: currentUser, updateProfile } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Local state for editing form only
  const [tempProfile, setTempProfile] = useState({
    name: '',
    restaurantName: '',
    email: '',
    phoneNumber: '',
    photo: null
  });

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Active Orders', href: '/vendor/orders', icon: ShoppingBag },
    { name: 'Menu Management', href: '/vendor/menu', icon: UtensilsCrossed },
    { name: 'Reviews', href: '/vendor/reviews', icon: Star },
    { name: 'Profile', href: '/vendor/profile', icon: User },
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // updateProfile from context calls the API and updates local state
      await updateProfile({
        fullName: tempProfile.name,
        email: tempProfile.email,
        phoneNumber: tempProfile.phoneNumber
      });
      setIsProfileOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const openProfileModal = () => {
    if (currentUser) {
      setTempProfile({
        name: currentUser.name || currentUser.fullName || '',
        restaurantName: currentUser.restaurantName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        photo: currentUser.photo || null
      });
    }
    setIsProfileOpen(true);
  };

  const displayName = currentUser?.restaurantName || 'Vendor';
  const displayInitial = displayName.charAt(0);
  const displayPhoto = currentUser?.photo;

  console.log("VendorLayout: Rendering with displayPhoto:", displayPhoto ? "Exists (Base64)" : "Null");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            RailMeal <span className="text-xs font-medium text-gray-500 block">Partner Portal</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {displayName}</span>
              <button
                onClick={openProfileModal}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-orange-100 hover:border-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    {displayInitial}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Profile Edit Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Edit Vendor Profile</h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-50 bg-orange-50 flex items-center justify-center">
                    {tempProfile.photo ? (
                      <img src={tempProfile.photo} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-orange-300">{tempProfile.restaurantName?.charAt(0)}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    <Camera className="w-8 h-8" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">Click to change logo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={tempProfile.restaurantName}
                  onChange={(e) => setTempProfile({ ...tempProfile, restaurantName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={tempProfile.phoneNumber}
                  onChange={(e) => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors font-medium shadow-sm flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
