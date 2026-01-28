"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { reviewAPI } from '@/services/api';
import { CheckCircle, Clock, MapPin, Package, ArrowLeft, Loader2, Phone, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getOrderById } = useOrder();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasShownReviewModal, setHasShownReviewModal] = useState(false); // Track if auto-popup happened
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        let interval;
        const fetchOrder = async () => {
            if (id) {
                try {
                    const data = await getOrderById(id);
                    setOrder(data);

                    // Zomato-Style Auto-Popup Logic
                    // If Delivered, No Review, and haven't shown modal yet -> Show it!
                    if (data.status === 'DELIVERED' && !data.review && !hasShownReviewModal) {
                        setShowReviewModal(true);
                        setHasShownReviewModal(true);
                    }

                } catch (err) {
                    console.error("Failed to update order status:", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrder();
        // Poll every 5 seconds for status updates
        interval = setInterval(fetchOrder, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await reviewAPI.add({ orderId: order.id, rating, comment });
            // alert("DEBUG: Review Saved! ID: " + res.id); // Removed Alert
            toast.success("Review submitted! Thank you.");

            // Update local order state with the new review so UI updates immediately
            setOrder(prev => ({
                ...prev,
                review: res // Backend returns the full ReviewResponse
            }));

            setShowReviewModal(false);
        } catch (error) {
            console.error("Failed to submit review:", error);
            const msg = error.response?.data?.message || "Failed to submit review. You may have already reviewed this order.";
            toast.error(msg);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                    <button onClick={() => router.push('/orders')} className="btn-primary">
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    // Status Steps Logic
    const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    // Map backend status to steps found or fallback
    // Note: status might be 'CREATED' or 'PLACED' initially, let's normalize
    const currentStatus = order.status === 'CREATED' ? 'PENDING' : order.status;
    const currentStepIndex = steps.indexOf(currentStatus) >= 0 ? steps.indexOf(currentStatus) : 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>

                <div>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
                            <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-full border border-orange-200">
                                {order.status}
                            </div>
                            {order.review ? (
                                <div className="text-right">
                                    <div className="flex items-center justify-end text-yellow-500 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < order.review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    {order.review.comment && (
                                        <p className="text-sm text-gray-500 italic max-w-[200px] truncate">"{order.review.comment}"</p>
                                    )}
                                    <p className="text-xs font-bold text-green-600 mt-1">✓ Review Submitted</p>
                                </div>
                            ) : (
                                order.status === 'DELIVERED' && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700 underline"
                                    >
                                        <Star className="w-4 h-4 mr-1 fill-orange-600" /> Rate your meal
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 overflow-hidden">
                        <h2 className="font-bold text-lg mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-orange-500" /> Order Status
                        </h2>
                        <div className="relative flex justify-between">
                            {/* Progress Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 rounded-full"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-1000"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-3 h-3 bg-gray-300 rounded-full" />}
                                        </div>
                                        <p className={`text-xs font-bold mt-2 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                            {step.replace(/_/g, ' ').replace('PENDING', 'PLACED')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-bold text-lg mb-4 flex items-center border-b pb-4">
                                    <Package className="w-5 h-5 mr-2 text-orange-500" /> Items Ordered
                                </h2>
                                <div className="space-y-6">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                    {/* Food Image Mocking for Order History since item might not have full details */}
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-2xl">🍽️</div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-orange-600 transition">{item.foodItemName || 'Food Item'}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t mt-6 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.totalAmount}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Tax & Fees</span><span>₹0.00</span></div>
                                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2">
                                        <span>Total</span>
                                        <span>₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-bold text-lg mb-4 flex items-center border-b pb-4">
                                    <MapPin className="w-5 h-5 mr-2 text-orange-500" /> Delivery To
                                </h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">Train</p>
                                        <p className="font-semibold text-gray-900">{order.trainName} ({order.trainNumber})</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">Reference</p>
                                        <p className="font-semibold text-gray-900">PNR: {order.pnrNumber}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold">Coach</p>
                                            <p className="font-semibold text-gray-900">{order.coachNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase font-bold">Seat</p>
                                            <p className="font-semibold text-gray-900">{order.seatNumber}</p>
                                        </div>
                                    </div>
                                    {order.deliveryInstructions && (
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 text-xs">
                                            <span className="font-bold block mb-1">Note:</span>
                                            "{order.deliveryInstructions}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-bold text-lg mb-4 flex items-center border-b pb-4">
                                    <Phone className="w-5 h-5 mr-2 text-orange-500" /> Need Help?
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Is there an issue with your order? Contact our support team.
                                </p>
                                <button className="w-full btn-secondary text-sm">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Rate your Meal</h2>
                            <p className="text-gray-500 mt-1">How was your food?</p>
                        </div>

                        <form onSubmit={handleSubmitReview}>
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Comments
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition h-32 resize-none"
                                    placeholder="Tell us what you liked or what could be improved..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview || rating === 0}
                                className="w-full btn-primary disabled:opacity-70 flex items-center justify-center"
                            >
                                {submittingReview ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}