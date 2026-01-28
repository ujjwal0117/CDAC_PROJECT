"use client";

import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, ShoppingBag, Loader2 } from 'lucide-react';
import { userAPI, orderAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            // Map API data to UI format
            const mappedUsers = data.map(user => ({
                id: user.id,
                name: user.fullName || user.username || "Unknown",
                email: user.email,
                phone: user.phoneNumber || "N/A",
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
                totalOrders: user.orderCount || 0,
                lastOrder: user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : "N/A",
                enabled: user.active !== false,
                // roles is a Set of strings like ["ROLE_CUSTOMER"], not objects
                role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER'
            }));
            setUsers(mappedUsers);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserHistory = async (userId) => {
        try {
            setLoadingOrders(true);
            const data = await orderAPI.getUserOrders(userId);
            const mappedOrders = data.map(order => ({
                id: order.id,
                restaurant: order.restaurant ? order.restaurant.name : "Unknown Restaurant",
                date: new Date(order.createdAt).toLocaleDateString(),
                amount: order.totalAmount,
                status: order.status,
                items: order.items.length + " items"
            }));
            setUserOrders(mappedOrders);
        } catch (err) {
            console.error("Failed to fetch user history:", err);
            toast.error("Failed to load user history");
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleViewHistory = (user) => {
        setSelectedUser(user);
        fetchUserHistory(user.id);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    const handleBanToggle = async (user) => {
        const action = user.enabled !== false ? 'ban' : 'unban';
        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            return;
        }
        try {
            await userAPI.setEnabled(user.id, !user.enabled);
            toast.success(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
            toast.error(`Failed to ${action} user`);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500 mt-1">View and manage registered customers</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email, or Phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User Details</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                                    <th className="px-6 py-4 font-semibold">Activity</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                            user.role === 'ROLE_VENDOR' || user.role === 'VENDOR' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {user.role?.replace('ROLE_', '') || 'Customer'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">ID: #{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                                    {user.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                {user.joinDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900 flex items-center">
                                                    <ShoppingBag className="h-4 w-4 mr-1 text-blue-600" />
                                                    {user.totalOrders !== 0 ? user.totalOrders : '0'} Orders
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Last: {user.lastOrder}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.enabled ? 'Active' : 'Banned'}
                                                </span>
                                                <button
                                                    onClick={() => handleViewHistory(user)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    History
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(user)}
                                                    className={`text-sm font-medium ${user.enabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                                >
                                                    {user.enabled ? 'Ban' : 'Unban'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users found.
                        </div>
                    )}
                </div>

                {/* History Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                                    <p className="text-sm text-gray-500">for {selectedUser.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>

                            {loadingOrders ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="space-y-4">
                                    {userOrders.length > 0 ? userOrders.map((order) => (
                                        <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="font-bold text-gray-900">{order.restaurant}</p>
                                                <p className="text-sm text-gray-500">{order.items}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-400">{order.date}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">₹{order.amount}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500">No orders found for this user.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}