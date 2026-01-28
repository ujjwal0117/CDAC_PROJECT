"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { orderAPI } from '@/services/api';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle, Truck, ChefHat, Package, ArrowLeft, Loader2, Clock } from 'lucide-react';

export default function TrackOrderPage({ params }) {
    const { id } = React.use(params);
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Only show loading on initial fetch
                if (!order) setLoading(true);
                const data = await orderAPI.getById(id);
                setOrder(data);
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setError('Order not found');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
            // Poll every 10 seconds
            const interval = setInterval(fetchOrder, 10000);
            return () => clearInterval(interval);
        }
    }, [id]);

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

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <div className="text-xl font-semibold text-gray-600 mb-4">{error || 'Order not found'}</div>
                <button
                    onClick={() => router.push('/orders')}
                    className="text-orange-600 hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const steps = [
        { id: 'PENDING', label: 'Order Placed', icon: Package },
        { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
        { id: 'PREPARING', label: 'Preparing', icon: ChefHat },
        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ];

    const orderStatus = (order.status || 'PENDING').toUpperCase();
    const currentStepIndex = steps.findIndex(step => step.id === orderStatus);
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-orange-600 mb-6 font-medium transition">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
                </button>

                <div>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Track Order</h1>
                                    <p className="opacity-90">Order ID: #{order.id}</p>
                                    <p className="opacity-75 text-sm mt-1">{order.restaurantName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">₹{(order.totalAmount || 0).toFixed(2)}</p>
                                    <p className="opacity-90">{order.items?.length || 0} Items</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="p-8 md:p-12">
                            <div className="relative">
                                {/* Progress Bar Background */}
                                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 -translate-y-1/2 rounded-full hidden md:block"></div>

                                {/* Active Progress Bar */}
                                <div
                                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                                    className="absolute top-1/2 left-0 h-2 bg-green-500 -translate-y-1/2 rounded-full hidden md:block transition-all duration-1000"
                                ></div>

                                <div className="flex flex-col md:flex-row justify-between relative z-10 space-y-8 md:space-y-0">
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= activeIndex;
                                        const isActive = index === activeIndex;

                                        return (
                                            <div key={step.id} className="flex md:flex-col items-center md:text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                                                    } ${isActive ? 'scale-110 shadow-lg ring-4 ring-green-100' : ''}`}>
                                                    <step.icon className="w-6 h-6" />
                                                </div>
                                                <div className="ml-4 md:ml-0 md:mt-4">
                                                    <p className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                                    {isActive && (
                                                        <p className="text-xs text-green-600 font-bold animate-pulse">In Progress</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {order.status === 'OUT_FOR_DELIVERY' && order.deliveryOtp && (
                            <div className="mx-8 md:mx-12 mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl animate-pulse flex flex-col items-center justify-center text-center">
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Share Delivery OTP with Agent</p>
                                <div className="text-5xl font-mono font-bold text-blue-800 tracking-[0.5em] bg-white px-8 py-4 rounded-xl shadow-sm border border-blue-100">
                                    {order.deliveryOtp}
                                </div>
                                <p className="text-xs text-blue-400 mt-2 font-medium">Do not share this code until you receive your food.</p>
                            </div>
                        )}

                        {/* Details */}
                        <div className="bg-gray-50 p-8 border-t border-gray-100 grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-orange-600" /> Delivery Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Train</span>
                                        <span className="font-medium text-gray-900">{order.trainName || order.trainNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">PNR</span>
                                        <span className="font-medium text-gray-900">{order.pnrNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Coach / Seat</span>
                                        <span className="font-medium text-gray-900">{order.coachNumber} / {order.seatNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-orange-600" /> Order Items
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span className="text-gray-700">{item.quantity}x {item.foodItemName}</span>
                                            <span className="font-medium text-gray-900">₹{(item.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
