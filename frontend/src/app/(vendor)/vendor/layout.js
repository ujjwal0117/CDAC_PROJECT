"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, User, LogOut, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/services/api';

export default function VendorLayout({ children }) {
  const pathname = usePathname();
  // Alias user -> currentUser to match existing code
  const { logout, user: currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  React.useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { restaurantAPI } = await import('@/services/api');
        const restaurants = await restaurantAPI.getMyRestaurants();
        if (restaurants && restaurants.length > 0) {
          setRestaurant(restaurants[0]);
        }
      } catch (err) {
        console.error("Failed to fetch restaurant in layout:", err);
      }
    };
    if (currentUser) {
      fetchRestaurant();
    }
  }, [currentUser]);

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Active Orders', href: '/vendor/orders', icon: ShoppingBag },
    { name: 'Menu Management', href: '/vendor/menu', icon: UtensilsCrossed },
    { name: 'Reviews', href: '/vendor/reviews', icon: Star },
    { name: 'Profile', href: '/vendor/profile', icon: User },
  ];


  const displayName = restaurant?.name || currentUser?.fullName || currentUser?.username || 'Vendor';
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
              <Link href="/vendor/profile" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                Welcome, {displayName}
              </Link>
              <Link
                href="/vendor/profile"
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-orange-100 hover:border-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    {displayInitial}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
