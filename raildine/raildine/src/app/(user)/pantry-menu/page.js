"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { pantryAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Plus, ShoppingCart, Star, Loader2, Train } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PantryMenu() {
    const { addToCart, cart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const trainId = searchParams.get('trainId');

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trainName, setTrainName] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                let data;

                if (trainId) {
                    // Fetch train-specific pantry menu
                    data = await pantryAPI.getMenuByTrain(trainId);
                } else {
                    // Fallback to all pantry items
                    data = await pantryAPI.getMenu();
                }

                setMenuItems(data || []);

                // Extract train name if available from first item
                if (data && data.length > 0 && data[0].trainName) {
                    setTrainName(data[0].trainName);
                }
            } catch (err) {
                console.error('Failed to fetch pantry menu:', err);
                // Fallback to general menu if train-specific fails
                try {
                    const fallbackData = await pantryAPI.getMenu();
                    setMenuItems(fallbackData || []);
                } catch (fallbackErr) {
                    setError('Failed to load pantry menu');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [trainId]);

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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-orange-600 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Pantry Menu</h1>
                        {trainName && (
                            <div className="flex items-center text-orange-100 mb-1">
                                <Train className="w-4 h-4 mr-2" />
                                <span>{trainName}</span>
                            </div>
                        )}
                        <p className="text-orange-100">Standard IRCTC meals served hot at your seat.</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                            <p className="text-sm font-medium">Average Delivery Time</p>
                            <p className="text-2xl font-bold">15-20 mins</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {error && (
                    <div className="text-center py-12 text-red-500">{error}</div>
                )}

                {menuItems.length === 0 && !error ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No pantry items available for this train at the moment.</p>
                        <p className="text-sm mt-2">Try ordering from station restaurants instead.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menuItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.foodItemName} className="w-full h-full object-cover" />
                                        ) : (
                                            '🍽️'
                                        )}
                                    </div>
                                    <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                                        <Star className="w-3 h-3 mr-1 fill-current" /> {item.rating || '4.2'}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.foodItemName || item.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                    {item.description || `Freshly prepared ${(item.foodItemName || item.name || '').toLowerCase()} served with accompaniments.`}
                                </p>

                                {item.quantity !== undefined && (
                                    <p className="text-xs text-gray-400 mb-2">In Stock: {item.quantity}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">₹{item.foodItemPrice || item.price || 0}</span>
                                    <button
                                        onClick={() => addToCart({
                                            id: item.foodItemId || item.id,
                                            name: item.foodItemName || item.name,
                                            price: item.foodItemPrice || item.price,
                                            restaurantId: 'pantry',
                                            trainId: trainId
                                        })}
                                        className="bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white p-3 rounded-xl transition-colors duration-300 flex items-center font-bold"
                                    >
                                        <Plus className="w-5 h-5 mr-1" /> Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Cart Button (Mobile) */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 md:hidden z-50">
                    <button
                        onClick={() => router.push('/orders/new')}
                        className="bg-orange-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center animate-bounce-slow"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                            {cart.length}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
