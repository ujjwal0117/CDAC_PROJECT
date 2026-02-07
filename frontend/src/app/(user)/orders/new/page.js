"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Trash2, Plus, Minus, Wallet, CreditCard, QrCode, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWallet } from '@/context/WalletContext';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pantryAPI, API_BASE_URL } from '@/services/api';

export default function CartPage() {
    const { cart, removeFromCart, addToCart, clearCart, cartTotal, orderContext } = useCart();
    const { balance, deductMoney } = useWallet();
    const { createOrder } = useOrder();
    const { user } = useAuth();
    const router = useRouter();

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form fields for delivery info
    const [pnrNumber, setPnrNumber] = useState(orderContext.pnrNumber || '');
    const [coachNumber, setCoachNumber] = useState(orderContext.coachNumber || '');
    const [seatNumber, setSeatNumber] = useState(orderContext.seatNumber || '');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const total = cartTotal();
    const tax = total * 0.05;
    const finalTotal = total + tax;

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order in Backend FIRST
            const newOrder = await createOrderOnServer();

            // 2. Call local API to get Razorpay Order ID
            const response = await fetch('/api/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalTotal })
            });
            const order = await response.json();
            if (order.error) throw new Error(order.error);

            const options = {
                key: 'rzp_test_RpC0BqmwMSjqTT', // Correct Key
                amount: order.amount,
                currency: order.currency,
                name: 'RailMeal',
                description: `Payment for Order #${newOrder.id}`,
                order_id: order.id, // Real Razorpay Order ID
                handler: async function (response) {
                    console.log("Payment Success:", response);
                    // 3. Finalize Order
                    await submitOrder(newOrder);
                },
                prefill: {
                    name: user?.fullName || "Customer",
                    email: user?.email || "customer@example.com",
                    contact: user?.phoneNumber || "9999999999"
                },
                theme: { color: "#ea580c" }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (err) {
            setError('Payment failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Separate function to just create the order object in backend
    const createOrderOnServer = async () => {
        // Get restaurantId from first cart item or orderContext
        let restaurantId = orderContext.restaurantId || cart[0]?.restaurantId;
        const trainId = orderContext.trainId || 1; // Default to 1 if not set

        // Handle pantry orders
        if (restaurantId === 'pantry') {
            restaurantId = 999; // IRCTC Pantry ID
        }

        // Build order request
        const orderRequest = {
            trainId: trainId,
            restaurantId: restaurantId,
            pnrNumber: pnrNumber,
            seatNumber: seatNumber,
            coachNumber: coachNumber,
            deliveryInstructions: deliveryInstructions,
            items: cart.map(item => ({
                foodItemId: item.id,
                quantity: item.quantity
            }))
        };

        return await createOrder(orderRequest);
    };

    const submitOrder = async (existingOrder = null) => {
        try {
            if (!existingOrder) {
                await createOrderOnServer();
            }

            setOrderPlaced(true);
            clearCart();
            setTimeout(() => router.push('/orders'), 3000);
        } catch (err) {
            console.error('Order creation failed:', err);
            setError('Failed to create order: ' + (err.message || 'Unknown error'));
            throw err;
        }
    };

    const handlePlaceOrder = async () => {
        setError('');

        // Validate required fields
        if (!pnrNumber || !coachNumber || !seatNumber) {
            setError('Please fill in PNR, Coach, and Seat details');
            return;
        }

        setLoading(true);

        try {
            if (paymentMethod === 'wallet') {
                if (balance < finalTotal) {
                    setError('Insufficient wallet balance. Please add money or choose another method.');
                    setLoading(false);
                    return;
                }

                // 1. Create Order First (returns order object with ID)
                const newOrder = await createOrderOnServer();

                // 2. Process Wallet Payment using the new Order ID
                await deductMoney(finalTotal, `Payment for Order #${newOrder.id}`, newOrder.id);

                // 3. Finalize
                await submitOrder(newOrder);

            } else if (paymentMethod === 'razorpay' || paymentMethod === 'razorpay_qr') {
                await handleRazorpayPayment();
            } else {
                // COD - just create the order
                await submitOrder();
            }
        } catch (err) {
            console.error('Order failed:', err);
            if (!error) {
                setError(err.message || 'Order failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-8">Your food is being prepared and will be delivered to your seat.</p>
                <Link href="/orders" className="btn-primary">View My Orders</Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-6xl">🛒</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added any food items yet.</p>
                    <Link href="/dashboard" className="btn-primary inline-block">Browse Restaurants</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items & Delivery Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-lg">Delivery Details</h2>
                            </div>
                            <div className="p-6 grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PNR Number *</label>
                                    <input
                                        type="text"
                                        value={pnrNumber}
                                        onChange={(e) => setPnrNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        placeholder="Enter PNR"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Coach *</label>
                                    <input
                                        type="text"
                                        value={coachNumber}
                                        onChange={(e) => setCoachNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        placeholder="e.g., S5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seat *</label>
                                    <input
                                        type="text"
                                        value={seatNumber}
                                        onChange={(e) => setSeatNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        placeholder="e.g., 42"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                                    <input
                                        type="text"
                                        value={deliveryInstructions}
                                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        placeholder="Any special instructions..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-lg">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    '🍽️'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center bg-gray-100 rounded-lg">
                                                <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-gray-200 rounded-l-lg"><Minus className="w-4 h-4" /></button>
                                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="p-2 hover:bg-gray-200 rounded-r-lg"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment & Bill */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-24 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-lg">Payment Details</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Bill Details */}
                                <div className="space-y-3 text-gray-600 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between"><span>Item Total</span><span>₹{total.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-xl text-gray-900 pt-2"><span>To Pay</span><span>₹{finalTotal.toFixed(2)}</span></div>
                                </div>

                                {/* Payment Methods */}
                                <div className="space-y-3">
                                    <p className="font-bold text-sm text-gray-500 uppercase tracking-wider">Choose Payment Method</p>

                                    {[
                                        { id: 'wallet', icon: Wallet, title: 'RailMeal Wallet', sub: `Balance: ₹${(balance || 0).toFixed(2)}`, color: 'text-blue-600' },
                                        { id: 'razorpay_qr', icon: QrCode, title: 'UPI QR Code', sub: 'Scan & Pay', color: 'text-purple-600' },
                                        { id: 'razorpay', icon: CreditCard, title: 'Pay Online', sub: 'Cards, NetBanking', color: 'text-green-600' },
                                        { id: 'cod', icon: Wallet, title: 'Cash on Delivery', sub: 'Pay on arrival', color: 'text-orange-600' }
                                    ].map((method) => (
                                        <label key={method.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === method.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-200'}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={() => setPaymentMethod(method.id)}
                                                className="mr-4 w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center font-bold text-gray-900">
                                                    <method.icon className={`w-5 h-5 mr-2 ${method.color}`} /> {method.title}
                                                </div>
                                                <div className="text-xs text-gray-500 ml-7">{method.sub}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className={`w-full btn-primary flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${finalTotal.toFixed(2)}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
