"use client";

import React, { useState } from 'react';
import { User, Lock, ArrowLeft, ShoppingBag, Store, Settings, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const userType = searchParams.get('type') || 'customer';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    let themeColor, title, icon, bgGradient;

    if (userType === 'customer') {
        themeColor = 'text-orange-600';
        bgGradient = 'from-orange-500 to-red-600';
        title = 'Customer Login';
        icon = <ShoppingBag className="w-8 h-8 text-white" />;
    } else if (userType === 'vendor') {
        themeColor = 'text-blue-600';
        bgGradient = 'from-blue-600 to-indigo-600';
        title = 'Partner Login';
        icon = <Store className="w-8 h-8 text-white" />;
    } else {
        themeColor = 'text-purple-600';
        bgGradient = 'from-purple-600 to-gray-900';
        title = 'Admin Portal';
        icon = <Settings className="w-8 h-8 text-white" />;
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(userType, username, password);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-10`}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 md:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <div
                            className={`w-16 h-16 mx-auto bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center shadow-lg mb-4`}
                        >
                            {icon}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                        <p className="text-gray-500">Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center text-sm">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <User className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field !pl-16 text-black"
                                    placeholder="Enter your username"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field !pl-16 text-black"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{' '}
                                <Link href={`/register?type=${userType}`} className={`font-bold ${themeColor} hover:underline`}>
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-6 text-gray-400 text-xs">
                    <p>Protected by RailMeal Secure Login</p>
                </div>
            </div>
        </div>
    );
}
