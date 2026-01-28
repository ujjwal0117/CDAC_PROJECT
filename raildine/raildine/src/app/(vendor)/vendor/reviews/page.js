"use client";

import React, { useEffect, useState } from 'react';
import { Star, Loader2, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';
import { reviewAPI, restaurantAPI } from '@/services/api';

export default function VendorReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Vendor's Restaurant
                console.log("Fetching vendor restaurants...");
                const restaurants = await restaurantAPI.getMyRestaurants();
                console.log("Vendor restaurants:", restaurants);

                if (restaurants && restaurants.length > 0) {
                    if (restaurants.length > 1) {
                        alert(`Warning: You have ${restaurants.length} restaurants. Showing ID: ${restaurants[0].id}`);
                    }
                    const myRestaurant = restaurants[0];
                    setRestaurant(myRestaurant);
                    console.log("Selected restaurant ID:", myRestaurant.id);

                    // 2. Get Reviews for that Restaurant
                    console.log("Fetching reviews for restaurant ID:", myRestaurant.id);
                    const reviewsData = await reviewAPI.getRestaurantReviews(myRestaurant.id);

                    alert(`DEBUG: Fetched ${reviewsData.length} reviews for Restaurant ID: ${myRestaurant.id}`);

                    console.log("Fetched reviews:", reviewsData);
                    setReviews(reviewsData);

                    // 3. Calculate Stats
                    calculateStats(reviewsData);
                } else {
                    alert("DEBUG: No restaurants found for this vendor account.");
                    console.warn("No restaurants found for this vendor.");
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateStats = (data) => {
        if (!data || data.length === 0) return;

        const total = data.length;
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / total;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(r => {
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });

        setStats({
            averageRating: avg.toFixed(1),
            totalReviews: total,
            ratingDistribution: distribution
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-gray-800">Restaurant Not Found</h2>
                <p className="text-gray-500">Please create a restaurant profile first.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
                        <p className="text-gray-500 mt-2">See what people are saying about {restaurant.name}</p>
                        <div className="mt-2 text-xs bg-gray-100 text-gray-600 inline-block px-2 py-1 rounded border border-gray-200">
                            Debug ID: {restaurant.id}
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Overall Rating */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Average Rating</p>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-4xl font-bold text-gray-900">{stats.averageRating}</span>
                                <div className="flex items-center mb-1.5 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(stats.averageRating) ? 'fill-current' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">Based on {stats.totalReviews} reviews</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                    </div>

                    {/* Total Reviews */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Reviews</p>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2">{stats.totalReviews}</h2>
                            <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                                <ThumbsUp className="w-4 h-4 mr-1" /> All time feedback
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rating Breakdown</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((r) => (
                                <div key={r} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <span className="w-3">{r}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${stats.totalReviews ? (stats.ratingDistribution[r] / stats.totalReviews) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-6 text-right">{stats.totalReviews ? Math.round((stats.ratingDistribution[r] / stats.totalReviews) * 100) : 0}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-lg text-gray-800">Recent Reviews</h2>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No reviews yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                                        <p className="text-gray-600 leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                Order #{review.orderId}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
