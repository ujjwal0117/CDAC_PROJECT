"use client";

import Link from 'next/link';
import { ChefHat, Train, ShieldCheck, ArrowRight, UtensilsCrossed, CreditCard, Search, MapPin } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen text-gray-800">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-2">
                            <div className="bg-orange-600 p-2 rounded-lg">
                                <ChefHat className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                                RailMeal
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <Link href="/login?type=customer" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Customer</Link>
                            <Link href="/login?type=vendor" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Partner</Link>

                        </div>
                        <Link href="/login?type=customer" className="btn-primary text-sm py-2 px-6">
                            Order Food
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                            Live on 500+ Trains
                        </div>

                        <h1 className="text-5xl font-bold leading-tight text-gray-900">
                            Delicious Food, <br />
                            <span className="text-orange-600">Delivered to Your Seat</span>
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed">
                            Experience restaurant-quality meals on your train journey. Simple, fast, and hygienic.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <Link href="/login?type=customer" className="btn-primary flex items-center">
                                Order Now <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link href="/login?type=vendor" className="btn-secondary">
                                Become a Partner
                            </Link>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">Trusted by 10k+ travelers daily</p>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <UtensilsCrossed className="text-green-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Veg Thali</h3>
                                        <p className="text-sm text-gray-500">Pantry Special</p>
                                    </div>
                                    <div className="ml-auto font-bold text-xl text-orange-600">₹250</div>
                                </div>
                                <div className="h-48 relative rounded-xl overflow-hidden mb-6">
                                    <img
                                        src="/images/veg-thali.png"
                                        alt="Veg Thali"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="text-center text-gray-400 text-sm">
                                Simple & Secure Ordering
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600">Get your food in 3 simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center p-6 border border-gray-100 rounded-xl bg-gray-50">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                            <h3 className="text-lg font-bold mb-2">Enter PNR</h3>
                            <p className="text-gray-600">Enter your PNR number to check restaurant availability at upcoming stations.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center p-6 border border-gray-100 rounded-xl bg-gray-50">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                            <h3 className="text-lg font-bold mb-2">Select Food</h3>
                            <p className="text-gray-600">Choose from a wide variety of cuisines and add them to your cart.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center p-6 border border-gray-100 rounded-xl bg-gray-50">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                            <h3 className="text-lg font-bold mb-2">Enjoy Meal</h3>
                            <p className="text-gray-600">Get fresh and hygienic food delivered right to your train seat.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RailMeal?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We bring convenience and quality to your train travel.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="simple-card">
                            <Train className="w-10 h-10 text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Track Your Train</h3>
                            <p className="text-gray-600">Real-time tracking to ensure timely delivery.</p>
                        </div>
                        <div className="simple-card">
                            <ShieldCheck className="w-10 h-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Hygienic Food</h3>
                            <p className="text-gray-600">FSSAI approved restaurants and hygienic packaging.</p>
                        </div>
                        <div className="simple-card">
                            <CreditCard className="w-10 h-10 text-purple-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                            <p className="text-gray-600">Multiple secure payment options including COD.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
