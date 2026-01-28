"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { MessageSquare, Star, Clock, MapPin, Plus, Minus, ArrowLeft, ArrowRight, Loader2, Search, Utensils, ThumbsUp, Calendar } from 'lucide-react';
import { reviewAPI, restaurantAPI } from '@/services/api';

export default function RestaurantMenu({ params }) {
    const { id } = React.use(params);
    const router = useRouter();
    const { addToCart, cart, cartTotal, removeFromCart, setOrderInfo } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [reviews, setReviews] = useState([]); // New State
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [isVegOnly, setIsVegOnly] = useState(false);

    // ... (existing filter logic)
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVeg = isVegOnly ? (item.vegetarian === true) : true;
        return matchesSearch && matchesVeg;
    });

    const groupedItems = filteredItems.reduce((acc, item) => {
        const category = item.category || 'All Items';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch restaurant, menu, AND reviews
                const [restaurantData, menuData, reviewsData] = await Promise.all([
                    restaurantAPI.getById(id),
                    restaurantAPI.getMenu(id),
                    reviewAPI.getRestaurantReviews(id)
                ]);
                setRestaurant(restaurantData);
                setMenuItems(menuData);
                setReviews(reviewsData || []);

                // Set restaurant context
                if (restaurantData) {
                    setOrderInfo({
                        restaurantId: restaurantData.id,
                        restaurantName: restaurantData.name
                    });
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load restaurant');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const getItemQuantity = (itemId) => {
        const item = cart.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    // Calculate Stats
    const calculateStats = () => {
        if (!reviews || reviews.length === 0) return { avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / total;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (distribution[r.rating] !== undefined) distribution[r.rating]++;
        });

        return { avg: avg.toFixed(1), total, distribution };
    };

    const stats = calculateStats();

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

    if (error || !restaurant) {
        return ( // ... existing error UI 
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error || 'Restaurant not found'}</p>
                        <button onClick={() => router.back()} className="btn-primary">Go Back</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <Navbar />

            {/* Restaurant Header */}
            <div className="relative bg-gray-900 text-white h-64">
                {restaurant.imageUrl && (
                    <img src={restaurant.imageUrl} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-6 left-4 z-10">
                    <button
                        onClick={() => router.back()}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition transform hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                                <Star className="w-3 h-3 mr-1 fill-current" /> {restaurant.rating?.toFixed(1) || 'N/A'}
                            </span>
                            {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {restaurant.deliveryTime || '30-45 mins'}</span>
                        </div>
                        {restaurant.description && (
                            <p className="text-gray-400 text-sm mt-2 max-w-2xl">{restaurant.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-4">

                    {/* TABS SWITCHER */}
                    <div className="flex space-x-8 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'menu' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Menu
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* Controls (Only show for Menu) */}
                    {activeTab === 'menu' && (
                        <>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for dishes..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={isVegOnly}
                                                onChange={() => setIsVegOnly(!isVegOnly)}
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors ${isVegOnly ? 'bg-green-100' : 'bg-gray-200'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${isVegOnly ? 'translate-x-6 bg-green-600' : ''} flex items-center justify-center`}>
                                                <div className={`w-2 h-2 rounded-full ${isVegOnly ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                            </div>
                                        </div>
                                        <div className="ml-3 font-medium text-gray-700">Veg Only</div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
                                {Object.keys(groupedItems).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => document.getElementById(`category-${category}`).scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                        className="whitespace-nowrap px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        {category} ({groupedItems[category].length})
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* MENU TAB */}
                {activeTab === 'menu' && (
                    <>
                        {Object.keys(groupedItems).length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search.</p>
                            </div>
                        ) : (
                            Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} id={`category-${category}`} className="mb-10 scroll-mt-40">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        {category}
                                        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-all group"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center mt-1 ${item.vegetarian ? 'border-green-600' : 'border-red-600'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${item.vegetarian ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                        </div>
                                                        {Math.random() > 0.8 && (
                                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wide">Bestseller</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-orange-600 transition-colors">{item.name}</h4>
                                                    <p className="text-gray-900 font-bold text-sm">₹{item.price}</p>
                                                    {item.description && (
                                                        <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="relative w-32 h-32 flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl shadow-sm" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-300"><Utensils className="w-8 h-8" /></div>
                                                    )}
                                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24">
                                                        {getItemQuantity(item.id) > 0 ? (
                                                            <div className="flex items-center justify-between bg-white text-green-600 font-bold rounded-lg shadow-lg border border-gray-200 h-9 overflow-hidden">
                                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"><Minus className="w-3 h-3" /></button>
                                                                <span className="text-sm">{getItemQuantity(item.id)}</span>
                                                                <button onClick={() => addToCart(item)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"><Plus className="w-3 h-3" /></button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => addToCart(item)} className="w-full bg-white text-orange-600 font-bold text-sm h-9 rounded-lg shadow-lg border border-gray-200 hover:bg-orange-50 uppercase tracking-wide">ADD</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-px bg-gray-100 mt-8"></div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                    <div>
                        {/* Stats Header */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Average Rating</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className="text-4xl font-bold text-gray-900">{stats.avg}</span>
                                        <div className="flex items-center mb-1.5 text-yellow-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-5 h-5 ${s <= Math.round(stats.avg) ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">Based on {stats.total} reviews</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rating Breakdown</p>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <div key={r} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <span className="w-3">{r}</span>
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${stats.total ? (stats.distribution[r] / stats.total) * 100 : 0}%` }}></div>
                                            </div>
                                            <span className="w-6 text-right">{stats.total ? Math.round((stats.distribution[r] / stats.total) * 100) : 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="font-bold text-lg text-gray-800">All Reviews</h2>
                            </div>
                            {reviews.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{review.username || 'Anonymous User'}</h3>
                                                        <p className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                    <span className="font-bold text-yellow-700 mr-1">{review.rating}</span>
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            </div>
                                            <div className="pl-12">
                                                <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Cart Bar */}
            {cart.length > 0 && (
                <div
                    className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 shadow-2xl z-50"
                >
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                            <p className="text-xl font-bold text-gray-900">₹{cartTotal()}</p>
                            <p className="text-xs text-orange-600 font-bold cursor-pointer hover:underline" onClick={() => router.push('/orders/new')}>View Detailed Bill</p>
                        </div>
                        <button
                            onClick={() => router.push('/orders/new')}
                            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg flex items-center transform hover:scale-105 active:scale-95"
                        >
                            Proceed to Pay <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

