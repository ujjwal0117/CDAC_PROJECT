"use client";

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function RatingModal({ isOpen, onClose, onSubmit, orderId }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(orderId, rating, review);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Rate Your Meal</h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">How was your food?</p>
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="focus:outline-none transition-transform hover:scale-110"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Write a Review (Optional)</label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none text-gray-900"
                            placeholder="Tell us about the taste, packaging, etc..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={rating === 0}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${rating === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-xl hover:scale-[1.02]'
                            }`}
                    >
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
}

