"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Package, Star, Loader2, RefreshCw } from 'lucide-react';
import RatingModal from '@/components/orders/RatingModal';

export default function OrdersPage() {
    const { orders, loading, rateOrder, refreshOrders } = useOrder();
    const router = useRouter();

    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const handleRateClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsRatingModalOpen(true);
    };

    const handleRatingSubmit = (orderId, rating, review) => {
        rateOrder(orderId, rating, review);
    };

    const getStatusColor = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-purple-100 text-purple-800';
            case 'ready': return 'bg-indigo-100 text-indigo-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Today';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
                    <button
                        onClick={refreshOrders}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Refresh Orders"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Start ordering food from your favorite restaurants!</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                        >
                            Order Now
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{order.restaurantName || 'Restaurant'}</h3>
                                        <p className="text-gray-600 flex items-center mt-1">
                                            <MapPin className="w-4 h-4 mr-1" /> {order.trainName || order.trainNumber || 'Train'}
                                            <span className="mx-2">•</span>
                                            <Clock className="w-4 h-4 mr-1" /> {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {(order.status || 'pending').replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-gray-900 font-bold text-lg">₹{(order.totalAmount || 0).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">{order.items?.length || 0} items • ID: #{order.id}</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        {order.status?.toLowerCase() === 'delivered' && !order.rating && (
                                            <button
                                                onClick={() => handleRateClick(order.id)}
                                                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition flex items-center"
                                            >
                                                <Star className="w-4 h-4 mr-2" /> Rate Order
                                            </button>
                                        )}
                                        {order.rating && (
                                            <div className="flex items-center text-yellow-500 font-bold px-4">
                                                <Star className="w-5 h-5 fill-current mr-1" /> {order.rating}/5
                                            </div>
                                        )}
                                        <button
                                            onClick={() => router.push(`/orders/${order.id}/track`)}
                                            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition flex items-center"
                                        >
                                            <Package className="w-4 h-4 mr-2" /> Track Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                orderId={selectedOrderId}
            />
        </div>
    );
}