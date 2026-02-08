"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw, ChefHat, Truck, ShoppingBag, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/services/api';


export default function OrdersPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setRefreshing(true);
            const data = await orderAPI.getVendorOrders();
            // Sort by date descending (newest first)
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 30 seconds
        const interval = setInterval(fetchOrders, 30000);

        return () => {
            clearInterval(interval);
        };
    }, []);


    const handleStatusUpdate = async (orderId, newStatus) => {
        let otp = null;

        if (newStatus === 'DELIVERED') {
            const input = prompt("Please enter the 4-digit Delivery OTP provided by the customer:");
            if (!input) return;
            otp = input.trim();
        } else {
            if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
        }

        setUpdatingId(orderId);
        try {
            const updatedOrder = await orderAPI.updateStatus(orderId, newStatus, otp);
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        } catch (err) {
            alert("Failed to update status: " + err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PREPARING': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'READY': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredOrders = filterStatus === 'ALL'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    // Group orders for quick stats
    const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const todayRevenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-500 text-sm">Manage and track your restaurant orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={refreshing}
                    className="flex items-center text-sm bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Orders'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Active Orders</p>
                        <p className="text-2xl font-bold text-orange-600">{activeOrders}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Completed Today</p>
                        <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Today's Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{todayRevenue}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="text-xl font-bold text-blue-500">₹</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2">
                {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-700">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">

                                        {order.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                                                    disabled={updatingId === order.id}
                                                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                                                >
                                                    Accept Order
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                                    disabled={updatingId === order.id}
                                                    className="bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                                disabled={updatingId === order.id}
                                                className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-700 transition flex items-center"
                                            >
                                                <ChefHat className="w-4 h-4 mr-1" /> Start Cooking
                                            </button>
                                        )}

                                        {order.status === 'PREPARING' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'READY')}
                                                disabled={updatingId === order.id}
                                                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition flex items-center"
                                            >
                                                <ShoppingBag className="w-4 h-4 mr-1" /> Mark Ready
                                            </button>
                                        )}

                                        {order.status === 'READY' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                                                disabled={updatingId === order.id}
                                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center"
                                            >
                                                <Truck className="w-4 h-4 mr-1" /> Handover to Delivery
                                            </button>
                                        )}

                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                                disabled={updatingId === order.id}
                                                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" /> Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Order Items */}
                                    <div className="lg:col-span-2 space-y-3">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</p>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-gray-100 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-gray-700">
                                                        {item.quantity}x
                                                    </span>
                                                    <div>
                                                        <p className="text-gray-800 font-medium">{item.foodItemName}</p>
                                                        <p className="text-xs text-gray-500">₹{item.price} per item</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500">Item Total: ₹{(order.subtotal || (order.totalAmount / 1.05)).toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Tax (5%): ₹{(order.taxAmount || (order.totalAmount - (order.totalAmount / 1.05))).toFixed(2)}</p>
                                                <p className="font-bold text-gray-600">Total Amount</p>
                                            </div>
                                            <p className="text-2xl font-bold text-orange-600">₹{(order.totalAmount || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Customer & Delivery Info */}
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Truck className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Delivery Location</p>
                                                <p className="text-sm font-bold text-gray-800 mt-1">
                                                    PNR: {order.pnrNumber}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Seat/Coach: {order.coachNumber && order.seatNumber ? `${order.coachNumber} / ${order.seatNumber}` : (order.deliveryAddress || 'Seat Info not provided')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Phone className="w-4 h-4 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Customer Contact</p>
                                                <p className="text-sm font-bold text-gray-800 mt-1">
                                                    {order.userFullName || order.username || 'Guest User'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.userPhoneNumber || 'No phone number'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Orders Found</h3>
                    <p className="text-gray-500 mt-1">New orders will appear here automatically.</p>
                </div>
            )}

        </div>
    );
};
