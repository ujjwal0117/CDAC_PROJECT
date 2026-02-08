"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Search, MapPin, Utensils, Coffee, Clock, ArrowRight, Wallet, ShoppingBag, Train, Hash, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { walletAPI, orderAPI, trainAPI } from '@/services/api';

// Custom debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function Dashboard() {
    const [searchType, setSearchType] = useState('pnr'); // 'pnr', 'name', 'number'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const router = useRouter();
    const { user } = useAuth();

    // Debounce the search query (300ms delay)
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Live search effect - triggered when debounced query changes
    useEffect(() => {
        const performLiveSearch = async () => {
            // Only perform live search for train name and number modes
            if (searchType === 'pnr') {
                return;
            }

            // Minimum characters check
            if (searchType === 'name' && debouncedSearchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            if (searchType === 'number' && debouncedSearchQuery.length < 1) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);

            try {
                let results;
                if (searchType === 'pnr') {
                    if (debouncedSearchQuery.length === 10) {
                        results = await trainAPI.getByPnr(debouncedSearchQuery);
                        // Wrap in array for consistent mapping
                        results = results ? [{ ...results, isPnrResult: true, pnr: debouncedSearchQuery }] : [];
                    } else {
                        results = [];
                    }
                } else if (searchType === 'name') {
                    results = await trainAPI.searchByName(debouncedSearchQuery);
                } else {
                    results = await trainAPI.searchByNumber(debouncedSearchQuery);
                }
                setSearchResults(results || []);
            } catch (error) {
                console.error('Live search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performLiveSearch();
    }, [debouncedSearchQuery, searchType]);

    const handleSearch = async (e) => {
        e.preventDefault();

        // For PNR mode or if it's a PNR-like query
        if (searchType === 'pnr' || (searchQuery.length === 10 && /^\d+$/.test(searchQuery))) {
            if (searchQuery.length === 10) {
                router.push(`/service-selection?pnr=${searchQuery}`);
            } else {
                alert('Please enter a valid 10-digit PNR');
            }
            return;
        }

        // For train name/number, if we have results, use the first one, or just wait for live results
        if (searchResults.length > 0) {
            handleTrainSelect(searchResults[0]);
        } else {
            if (searchType === 'name' && searchQuery.length < 2) {
                alert('Please enter at least 2 characters to search');
            } else if (searchType === 'number' && searchQuery.length < 1) {
                alert('Please enter a train number to search');
            }
        }
    };

    const handleTrainSelect = (train) => {
        if (train.isPnrResult || searchType === 'pnr') {
            router.push(`/service-selection?pnr=${train.pnr || searchQuery}`);
        } else {
            // Navigate to trains page with selected train
            router.push(`/trains/${train.id || train.trainId}`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const balance = await walletAPI.getBalance(user.id);
                    setWalletBalance(balance);

                    const orders = await orderAPI.getUserOrders(user.id);
                    // Sort by ID desc (newest first) and take top 2
                    const sortedOrders = (orders || []).sort((a, b) => b.id - a.id).slice(0, 2);
                    setRecentOrders(sortedOrders);
                } catch (error) {
                    console.error("Failed to fetch dashboard data", error);
                } finally {
                    setLoadingData(false);
                }
            }
        };

        fetchData();
    }, [user]);

    // Clear results when switching search types
    useEffect(() => {
        setSearchResults([]);
        setSearchQuery('');
    }, [searchType]);

    const searchTabs = [
        { id: 'pnr', label: 'PNR', icon: FileText, placeholder: 'Enter 10-digit PNR Number' },
        { id: 'name', label: 'Train Name', icon: Train, placeholder: 'Type train name (e.g., Rajdhani)...' },
        { id: 'number', label: 'Train Number', icon: Hash, placeholder: 'Type train number (e.g., 12301)...' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="relative bg-[#0B1121] border-b border-gray-800 pb-24 pt-12 px-4 overflow-hidden">
                {/* Decorative Blobs - Adjusted for Dark Mode */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">{user?.fullName || user?.username || 'Traveler'}</span>! 👋
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                                Ready for your next meal? Search by PNR, train name, or train number to explore food options.
                            </p>
                        </div>

                        {/* Wallet Display (Desktop) - Dark Glass Effect */}
                        <div className="hidden md:block bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                    <Wallet className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Wallet Balance</p>
                                    <p className="text-3xl font-bold text-white tracking-tight">₹{Number(walletBalance).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-10">
                {/* Search Card */}
                <div id="search-section" className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 mb-12 relative z-10 ring-1 ring-black/5">
                    {/* Search Type Tabs */}
                    <div className="flex justify-center gap-3 mb-8 flex-wrap">
                        {searchTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSearchType(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-200 ${searchType === tab.id
                                    ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={searchTabs.find(t => t.id === searchType)?.placeholder}
                                    className="w-full pl-14 pr-12 py-5 rounded-2xl border-2 border-gray-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-lg font-medium !text-black transition-all shadow-sm placeholder-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    maxLength={searchType === 'pnr' ? 10 : 50}
                                />
                                {/* Live search loading indicator */}
                                {isSearching && searchType !== 'pnr' && (
                                    <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500 animate-spin" />
                                )}
                            </div>
                            <button
                                type="submit"
                                className="bg-orange-600 text-white text-lg font-bold px-10 rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-sm flex items-center justify-center gap-2"
                            >
                                {searchType === 'pnr' ? 'Search Food' : 'Search Trains'}
                            </button>
                        </div>
                        <p className="text-center text-gray-500 mt-4 text-sm font-medium h-6">
                            {searchQuery.length < (searchType === 'pnr' ? 10 : 2)
                                ? <span className="opacity-50">
                                    {searchType === 'pnr' ? '🔢 Enter 10-digit PNR to see details...' : '✨ Start typing to see matching trains...'}
                                </span>
                                : isSearching
                                    ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Searching...</span>
                                    : searchResults.length > 0
                                        ? <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                            {searchType === 'pnr' ? '✅ PNR Details Found' : `✅ Found ${searchResults.length} train${searchResults.length !== 1 ? 's' : ''}`}
                                        </span>
                                        : searchQuery.length >= (searchType === 'pnr' ? 10 : 2)
                                            ? <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full">
                                                {searchType === 'pnr' ? '😕 Invalid or Unknown PNR' : '😕 No trains found'}
                                            </span>
                                            : ''
                            }
                        </p>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-8 max-w-3xl mx-auto">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">
                                Found {searchResults.length} train{searchResults.length !== 1 ? 's' : ''}
                            </h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {searchResults.map((train) => (
                                    <div
                                        key={train.id}
                                        onClick={() => handleTrainSelect(train)}
                                        className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                        {train.trainNumber}
                                                    </span>
                                                    <h4 className="font-bold text-gray-900 text-lg">{train.trainName}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{train.source}</span>
                                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                                    <span>{train.destination}</span>
                                                </div>
                                                {train.stations && train.stations.length > 0 && (
                                                    <p className="text-xs text-gray-400 mt-3 pl-1 border-l-2 border-gray-100">
                                                        Stops: {train.stations.slice(0, 5).join(' → ')}
                                                        {train.stations.length > 5 && ` + ${train.stations.length - 5} more`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats / Recent Activity for Mobile */}
                <div className="md:hidden grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Balance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{Number(walletBalance).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{recentOrders.length > 0 ? recentOrders.length : 0} Recent</p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Utensils, title: "E-Catering", desc: "Order from top rated restaurants at upcoming stations.", color: "text-blue-600", bg: "bg-blue-50", cardBg: "bg-blue-50/30", border: "border-blue-100 hover:border-blue-200", link: "#search-section" },
                        { icon: Coffee, title: "Pantry Car", desc: "Official IRCTC pantry food delivered to your seat.", color: "text-orange-600", bg: "bg-orange-50", cardBg: "bg-orange-50/30", border: "border-orange-100 hover:border-blue-200", link: "#search-section" },
                        { icon: Clock, title: "Pre-Order", desc: "Schedule your meals in advance for the whole journey.", color: "text-green-600", bg: "bg-green-50", cardBg: "bg-green-50/30", border: "border-green-100 hover:border-blue-200", link: "#search-section" }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                if (item.link.startsWith('#')) {
                                    document.getElementById(item.link.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                    // Optional: Focus the search input
                                    const input = document.querySelector('#search-section input');
                                    if (input) input.focus();
                                } else {
                                    router.push(item.link);
                                }
                            }}
                            className={`${item.cardBg} p-8 rounded-3xl shadow-sm border ${item.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group`}
                        >
                            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                            <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                                Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders Section */}
                {recentOrders.length > 0 && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                            <button onClick={() => router.push('/orders')} className="text-orange-600 font-semibold hover:underline">
                                View All
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:border-orange-200 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-lg">
                                                #{order.id}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            ₹{order.totalAmount} • {order.items?.length || 0} Items
                                        </h3>
                                        <p className="text-sm text-green-600 font-medium">
                                            {order.status || 'Processing'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                        className="bg-gray-50 p-2 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <ArrowRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

