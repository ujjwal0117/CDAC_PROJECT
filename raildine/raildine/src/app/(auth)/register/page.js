"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, ShieldCheck, ArrowRight, Mail, Lock, Phone, UserPlus, AtSign, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const initialType = searchParams.get('type') || 'customer';
    const [userType, setUserType] = useState(initialType);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        // Vendor-specific fields
        businessName: '',
        gstNumber: '',
        address: '',
        // Admin-specific fields
        employeeId: '',
        department: ''
    });
    const { register } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(userType, formData);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'customer', label: 'Customer', icon: User, color: 'text-orange-600', bg: 'bg-orange-100' },
        { id: 'vendor', label: 'Partner', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side - Visual */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Join RailMeal</h2>
                        <p className="text-orange-100">Experience the future of train dining. Fresh food, delivered right to your seat.</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">10k+ Users</p>
                                <p className="text-xs text-orange-200">Joined this month</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-7/12 p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
                        <Link href="/" className="text-sm text-gray-500 hover:text-orange-600">Back to Home</Link>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setUserType(tab.id)}
                                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${userType === tab.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${userType === tab.id ? tab.color : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field - NEW */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. johndoe123"
                                    className="input-field !pl-16 text-black"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    className="input-field !pl-16 text-black"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="e.g. name@example.com"
                                    className="input-field !pl-16 text-black"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    className="input-field !pl-16 text-black"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field !pl-16 text-black"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                        </div>

                        {/* Vendor-specific fields */}
                        {userType === 'vendor' && (
                            <>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                                    <div className="relative">
                                        <ShoppingBag className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Tasty Kitchen"
                                            className="input-field !pl-16 text-black"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. 22AAAAA0000A1Z5"
                                            className="input-field !pl-16 text-black"
                                            value={formData.gstNumber}
                                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
                                    <div className="relative">
                                        <textarea
                                            placeholder="Enter your business address"
                                            className="input-field text-black min-h-[80px] pt-3"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Admin-specific fields */}
                        {userType === 'admin' && (
                            <>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. EMP12345"
                                            className="input-field !pl-16 text-black"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. IT Support"
                                            className="input-field !pl-16 text-black"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Sign Up <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href={`/login?type=${userType}`} className="font-bold text-orange-600 hover:text-orange-700">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
