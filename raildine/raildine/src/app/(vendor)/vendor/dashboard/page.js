"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingBag, Wallet, Clock, TrendingUp, ArrowRight,
    Star, Users, ChefHat, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderAPI, restaurantAPI } from '@/services/api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        preparingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Restaurant Details
                const restaurants = await restaurantAPI.getMyRestaurants();
                if (restaurants && restaurants.length > 0) {
                    setRestaurant(restaurants[0]);
                }

                // 2. Fetch Orders for Stats
                const orders = await orderAPI.getVendorOrders();

                // Calculate Stats
                const today = new Date().toDateString();
                const todayOrderList = orders.filter(o => new Date(o.createdAt).toDateString() === today);
                const completedOrders = orders.filter(o => o.status === 'DELIVERED');

                setStats({
                    totalOrders: orders.length,
                    todayOrders: todayOrderList.length,
                    totalRevenue: completedOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                    todayRevenue: todayOrderList
                        .filter(o => o.status !== 'CANCELLED')
                        .reduce((sum, o) => sum + o.totalAmount, 0),
                    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
                    preparingOrders: orders.filter(o => o.status === 'PREPARING' || o.status === 'CONFIRMED').length
                });

                // Get 5 most recent orders
                const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                setRecentOrders(sortedOrders);

            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'PREPARING': return 'bg-orange-100 text-orange-800';
            case 'READY': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {restaurant?.name || user?.fullName || 'Vendor'}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Here's what's happening with your restaurant today.
                    </p>
                </div>
                {restaurant && (
                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center ${restaurant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${restaurant.active ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        {restaurant.active ? 'Accepting Orders' : 'Currently Offline'}
                    </div>
                )}
            </div>

            {/* Default State - No Restaurant */}
            {!restaurant && !loading && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Complete Your Setup</h3>
                            <p className="text-gray-600 text-sm">You haven't created a restaurant profile yet.</p>
                        </div>
                    </div>
                    <Link href="/vendor/profile" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition">
                        Create Profile
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Wallet className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +₹{stats.todayRevenue} today
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{stats.todayOrders} new today
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Action required</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Preparing</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.preparingOrders}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <ChefHat className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">In kitchen</p>
                </div>
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900">Recent Activity</h2>
                        <Link href="/vendor/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div>
                        {recentOrders.length > 0 ? (
                            recentOrders.map(order => (
                                <div key={order.id} className="px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-600 truncate max-w-xs">
                                            {order.items?.map(i => `${i.quantity} x ${i.foodItemName}`).join(', ')}
                                        </p>
                                        <span className="font-bold text-sm text-gray-900">₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <ShoppingBag className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                                <p>No recent orders found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-6">
                    {/* Menu Shortcut */}
                    <Link href="/vendor/menu" className="block group">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 transform transition group-hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <ChefHat className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h3 className="font-bold text-lg">Manage Menu</h3>
                            <p className="text-orange-100 text-sm mt-1">Add new dishes or update prices</p>
                        </div>
                    </Link>

                    {/* Reviews Shortcut */}
                    <Link href="/vendor/reviews" className="block group">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Performance</h3>
                                    <p className="text-gray-500 text-sm mt-1">Review your restaurant ratings</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
