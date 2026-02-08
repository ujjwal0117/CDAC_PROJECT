"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, Train, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWallet } from '@/context/WalletContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { balance } = useWallet();

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const displayName = user?.fullName || user?.username || 'User';

    return (
        <nav className="bg-white text-gray-800 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                        <div className="bg-orange-600 p-1.5 rounded-lg">
                            <Train className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-orange-600 tracking-tight">RailMeal</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link href="/wallet" className="flex items-center hover:text-orange-600 transition bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <Wallet className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-semibold text-sm">₹{Number(balance || 0).toFixed(2)}</span>
                        </Link>

                        <Link href="/orders" className="text-gray-600 hover:text-orange-600 transition font-medium text-sm">My Orders</Link>
                        <Link href="/support" className="text-gray-600 hover:text-orange-600 transition font-medium text-sm">Support</Link>

                        <Link href="/orders/new" className="relative text-gray-600 hover:text-orange-600 transition">
                            <ShoppingCart className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
                            <Link href="/profile" className="flex items-center text-gray-600 hover:text-orange-600 transition">
                                <User className="w-5 h-5 mr-2" />
                                <span className="font-medium text-sm">{displayName}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="text-gray-400 hover:text-orange-600 transition"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
