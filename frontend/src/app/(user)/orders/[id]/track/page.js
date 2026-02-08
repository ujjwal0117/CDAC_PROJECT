"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { orderAPI } from '@/services/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, ChefHat, Package, ArrowLeft, Loader2 } from 'lucide-react';

export default function TrackOrderPage({ params }) {
    const { id } = React.use(params);
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
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
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-orange-600 mb-6 font-medium transition">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
                </button>

                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white text-center">
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Order Status</h1>
                            <p className="opacity-80 font-medium">Order ID: #{order.id}</p>
                        </div>

                        {/* Timeline */}
                        <div className="p-8">
                            <div className="relative pl-8 border-l-2 border-dashed border-gray-100 space-y-10">
                                {steps.map((step, index) => {
                                    const isCompleted = index <= activeIndex;
                                    const isActive = index === activeIndex;

                                    return (
                                        <div key={step.id} className="relative">
                                            <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' : 'bg-white border-gray-200 text-gray-300'
                                                } ${isActive ? 'scale-110 ring-4 ring-green-50' : ''}`}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-lg font-bold transition-colors ${isCompleted ? 'text-gray-900 leading-none' : 'text-gray-400'}`}>{step.label}</p>
                                                {isActive && (
                                                    <p className="text-xs text-green-600 font-extrabold uppercase mt-2 tracking-wider animate-pulse flex items-center">
                                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-ping"></span>
                                                        Current Status
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {order.status === 'OUT_FOR_DELIVERY' && order.deliveryOtp && (
                            <div className="m-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-500 uppercase text-center mb-3 tracking-widest">Delivery Confirmation OTP</p>
                                <div className="text-4xl font-mono font-bold text-blue-700 text-center tracking-[0.4em] bg-white py-4 rounded-xl shadow-sm border border-blue-200">
                                    {order.deliveryOtp}
                                </div>
                                <p className="text-[10px] text-blue-400 text-center mt-3 font-medium px-4">Share this OTP with the delivery agent when you receive your order.</p>
                            </div>
                        )}

                        {/* Details Summary */}
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Items Count</p>
                                <p className="text-lg font-bold text-gray-900">{order.items?.length || 0} Items</p>
                            </div>
                        </div>
                    </div>

                    {/* Agent Info */}
                    {order.status === 'OUT_FOR_DELIVERY' && order.deliveryPersonName && (
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">On the Way</p>
                                <p className="text-xl font-bold text-gray-900">{order.deliveryPersonName}</p>
                                <p className="text-gray-500 font-medium">{order.deliveryPersonPhone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
