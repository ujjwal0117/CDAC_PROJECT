"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Loader2, RefreshCw } from 'lucide-react';

export default function WalletPage() {
    const { balance, transactions, loading, addMoney, confirmAddMoney, refreshWallet } = useWallet();
    const [amount, setAmount] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Use Auth to get user details for prefill
    const { user } = useAuth();

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setProcessing(true);
        setError('');

        try {
            // Initiate add money (creates payment order)
            const paymentOrder = await addMoney(parseFloat(amount));

            if (paymentOrder?.razorpayOrderId) {
                const options = {
                    key: 'rzp_test_RpC0BqmwMSjqTT', // Correct Key from Backend config
                    amount: paymentOrder.amount * 100, // Amount is in paise
                    currency: paymentOrder.currency,
                    name: 'RailMeal Wallet',
                    description: 'Wallet Recharge',
                    order_id: paymentOrder.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            await confirmAddMoney(response.razorpay_payment_id, response.razorpay_order_id);
                            setAmount('');
                            setShowAddModal(false);
                        } catch (err) {
                            console.error('Confirmation failed:', err);
                            setError('Payment successful but wallet update failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: user?.fullName || 'RailMeal User',
                        email: user?.email || 'user@example.com',
                        contact: user?.phoneNumber || '9999999999'
                    },
                    theme: {
                        color: '#3b82f6'
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    setError('Payment failed: ' + response.error.description);
                });
                rzp1.open();
            }
        } catch (err) {
            console.error('Add money failed:', err);
            setError(err.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl mb-12 relative overflow-hidden animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0 text-center md:text-left">
                            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">Total Balance</p>
                            <h1 className="text-5xl font-bold mb-2">₹{(balance || 0).toFixed(2)}</h1>
                            <p className="text-gray-400 text-xs">Available for food orders</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={refreshWallet}
                                className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 transition"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Add Money
                            </button>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full -ml-10 -mb-10 blur-3xl"></div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold flex items-center">
                            <History className="w-5 h-5 mr-2 text-gray-500" /> Recent Transactions
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History className="w-8 h-8 text-gray-400" />
                                </div>
                                <p>No transactions yet.</p>
                            </div>
                        ) : (
                            transactions.map((txn) => (
                                <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${txn.type === 'CREDIT' || txn.type === 'credit'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {txn.type === 'CREDIT' || txn.type === 'credit'
                                                ? <ArrowDownLeft className="w-6 h-6" />
                                                : <ArrowUpRight className="w-6 h-6" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{txn.description || 'Transaction'}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(txn.createdAt || txn.date)} • {formatTime(txn.createdAt || txn.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-lg ${txn.type === 'CREDIT' || txn.type === 'credit'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {txn.type === 'CREDIT' || txn.type === 'credit' ? '+' : '-'}₹{(txn.amount || 0).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add Money Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <h2 className="text-2xl font-bold mb-6">Add Money to Wallet</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-4 text-gray-400 text-lg">₹</span>
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-xl font-bold"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    autoFocus
                                    disabled={processing}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[100, 500, 1000].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className="py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-bold text-gray-600"
                                    disabled={processing}
                                >
                                    + ₹{val}
                                </button>
                            ))}
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => { setShowAddModal(false); setError(''); }}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMoney}
                                disabled={processing || !amount || parseFloat(amount) <= 0}
                                className={`flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center ${(processing || !amount || parseFloat(amount) <= 0) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    'Proceed to Pay'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
