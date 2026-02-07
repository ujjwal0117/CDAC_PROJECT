"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { restaurantAPI } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MapPin, Clock, ArrowRight, Loader2, Search } from 'lucide-react';

export default function Restaurants() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stationId = searchParams.get('stationId');

    const [restaurants, setRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                // Fetch restaurants by station if stationId provided, otherwise get all
                let data;
                if (stationId) {
                    data = await restaurantAPI.getByStation(stationId);
                } else {
                    data = await restaurantAPI.getAll();
                }
                setRestaurants(data);
            } catch (err) {
                console.error('Failed to fetch restaurants:', err);
                setError('Failed to load restaurants');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, [stationId]);

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

            <div className="bg-blue-600 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Restaurants Nearby</h1>
                        <p className="text-blue-100">Order from top-rated restaurants delivering to your station.</p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or cuisine..."
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-blue-700 transition-all shadow-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {error && (
                    <div className="text-center py-12 text-red-500">{error}</div>
                )}

                {(() => {
                    const filteredRestaurants = restaurants.filter(r =>
                        r.active === true && (
                            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                    );

                    if (filteredRestaurants.length === 0 && !error) {
                        return (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
                                <p className="text-gray-500">We couldn't find any restaurants matching "{searchTerm}"</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-6 text-blue-600 font-bold hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRestaurants.map((restaurant) => (
                                <div
                                    key={restaurant.id}
                                    onClick={() => router.push(`/restaurants/${restaurant.id}${stationId ? `?stationId=${stationId}` : ''}`)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                                >
                                    <div className="h-48 bg-gray-200 relative">
                                        {restaurant.imageUrl ? (
                                            <img
                                                src={restaurant.imageUrl}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100"
                                            style={{ display: restaurant.imageUrl ? 'none' : 'flex' }}
                                        >
                                            <span className="text-4xl">🍽️</span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center text-gray-900">
                                            <Clock className="w-3 h-3 mr-1" /> {restaurant.deliveryTime || '30-45 min'}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{restaurant.name}</h3>
                                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                                                <Star className="w-3 h-3 mr-1 fill-current" /> {restaurant.rating?.toFixed(1) || '4.0'}
                                            </div>
                                        </div>

                                        {restaurant.description && (
                                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
                                        )}

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {(restaurant.cuisine || 'Multi-Cuisine').split(',').map((tag, i) => (
                                                <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-100">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center text-gray-500 text-sm mb-6">
                                            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                                            <span>Delivering at: <span className="font-semibold text-gray-700">{restaurant.stationName || 'Loading...'}</span></span>
                                        </div>

                                        <div className="w-full btn-secondary text-center flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100">
                                            View Menu <ArrowRight className="ml-2 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
