"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, LogOut, LayoutDashboard, Truck, Train, ShoppingBag, Users, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/services/api';

export default function AdminLayout({ children }) {
    const { logout } = useAuth();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [adminProfile, setAdminProfile] = React.useState({
        name: 'Loading...',
        email: '',
        role: 'Admin',
        photo: null
    });
    const [tempProfile, setTempProfile] = React.useState(adminProfile);

    // Fetch real admin profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await userAPI.getProfile();
                const roleName = profile.roles && profile.roles.length > 0
                    ? profile.roles[0].replace('ROLE_', '')
                    : 'Admin';
                setAdminProfile({
                    name: profile.fullName || profile.username || 'Admin',
                    email: profile.email || '',
                    role: roleName,
                    photo: null
                });
                setTempProfile({
                    name: profile.fullName || profile.username || 'Admin',
                    email: profile.email || '',
                    role: roleName,
                    photo: null
                });
            } catch (error) {
                console.error('Failed to fetch admin profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Vendors', href: '/admin/restaurants', icon: Truck },
        { name: 'Trains', href: '/admin/trains', icon: Train },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setAdminProfile(tempProfile);
        setIsProfileOpen(false);
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

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        RailMeal <span className="text-xs font-medium text-gray-500 block">Admin Portal</span>
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
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{adminProfile.name}</span>
                            <button
                                onClick={() => {
                                    setTempProfile(adminProfile);
                                    setIsProfileOpen(true);
                                }}
                                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold hover:bg-blue-200 transition-colors cursor-pointer ring-offset-2 hover:ring-2 ring-blue-400 overflow-hidden"
                                title="Edit Profile"
                            >
                                {adminProfile.photo ? (
                                    <img src={adminProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    adminProfile.name.charAt(0)
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>

                {/* Profile Edit Modal */}
                {isProfileOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-3 overflow-hidden relative group cursor-pointer">
                                        {tempProfile.photo ? (
                                            <img src={tempProfile.photo} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-blue-600">{tempProfile.name.charAt(0)}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white w-8 h-8" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500">Tap to change photo</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                        value={tempProfile.name}
                                        onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                        value={tempProfile.email}
                                        onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                        value={tempProfile.role}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
