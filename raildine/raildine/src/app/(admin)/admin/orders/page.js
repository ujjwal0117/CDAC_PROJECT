"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, Eye, Calendar, Loader2 } from 'lucide-react';
import { orderAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getAll();
            // Data mapping to match UI requirements (field names match OrderResponse DTO)
            const mappedOrders = data.map(order => ({
                id: "ORD-" + order.id,
                rawId: order.id,
                customer: order.userFullName || "Unknown User",
                vendor: order.restaurantName || "Unknown Vendor",
                train: order.trainName ? `${order.trainName} (${order.trainNumber})` : "N/A",
                amount: order.totalAmount,
                status: order.status.toLowerCase(),
                date: new Date(order.createdAt).toLocaleString(),
                items: order.items?.length || 0
            }));
            setOrders(mappedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-indigo-100 text-indigo-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-teal-100 text-teal-800';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'pending': return <Clock className="w-4 h-4 mr-1" />;
            case 'confirmed':
            case 'preparing':
            case 'ready': return <AlertCircle className="w-4 h-4 mr-1" />;
            case 'out_for_delivery': return <Clock className="w-4 h-4 mr-1" />;
            case 'cancelled': return <XCircle className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(order => {
        let matchesStatus = statusFilter === 'all';
        if (statusFilter === 'in_progress') {
            matchesStatus = ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
        } else if (statusFilter !== 'all') {
            matchesStatus = order.status === statusFilter;
        }
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.vendor.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleStatusChange = async (rawOrderId, newStatus) => {
        try {
            await orderAPI.updateStatus(rawOrderId, newStatus.toUpperCase());
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Failed to update order status");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Oversight</h1>
                        <p className="text-gray-500 mt-1">Track and manage orders across all vendors</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, or Vendor..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === filter.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order ID</th>
                                    <th className="px-6 py-4 font-semibold">Customer & Vendor</th>
                                    <th className="px-6 py-4 font-semibold">Train Details</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-blue-600">{order.id}</span>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {order.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{order.customer}</p>
                                                <p className="text-gray-500 text-xs">via {order.vendor}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <p>{order.train}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ₹{order.amount}
                                                <span className="text-gray-400 font-normal text-xs ml-1">({order.items} items)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => {
                                                        console.log('Changing order', order.rawId, 'from', order.status, 'to', e.target.value);
                                                        handleStatusChange(order.rawId, e.target.value);
                                                    }}
                                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-700 cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="out_for_delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-0 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                    <p className="text-sm text-gray-500 font-mono">{selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Customer Info</h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="font-medium text-gray-800">{selectedOrder.customer}</p>
                                            <p>+91 98765 43210</p>
                                            <p>Seat 45, Coach B2</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Logistics</h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="font-medium text-gray-800">{selectedOrder.vendor}</p>
                                            <p>{selectedOrder.train}</p>
                                            <p className="text-blue-600">Expected Delivery: Today, 13:45</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1 space-y-4">
                                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm h-full">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex justify-between">
                                            <span>Order Summary</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </h3>

                                        <div className="space-y-3 mb-4">
                                            {[1, 2, 3].slice(0, selectedOrder.items).map((i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Delicious Meal Item {i}</span>
                                                    <span className="font-medium text-gray-900">₹{(selectedOrder.amount / selectedOrder.items).toFixed(0)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Total Amount</span>
                                            <span className="font-bold text-xl text-blue-600">₹{selectedOrder.amount}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-right">Paid via UPI</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        const invoiceContent = `
RAILMEAL - ORDER INVOICE
--------------------------------
Order ID: ${selectedOrder.id}
Date: ${selectedOrder.date}
Status: ${selectedOrder.status.toUpperCase()}

CUSTOMER DETAILS
--------------------------------
Name: ${selectedOrder.customer}
Contact: +91 98765 43210
Seat: 45, Coach B2

ORDER DETAILS
--------------------------------
Vendor: ${selectedOrder.vendor}
Train: ${selectedOrder.train}
Items: ${selectedOrder.items}
Total Amount: ₹${selectedOrder.amount}

Thank you for choosing RailMeal!
--------------------------------
Generated on: ${new Date().toLocaleString()}
                                        `;
                                        const blob = new Blob([invoiceContent], { type: 'text/plain' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Invoice_${selectedOrder.id}.txt`;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-sm"
                                >
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}