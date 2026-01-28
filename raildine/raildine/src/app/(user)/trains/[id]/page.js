"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { trainAPI } from '@/services/api';
import { Train, MapPin, ArrowRight, Clock, Calendar, Loader2, AlertCircle, ChevronRight, Utensils } from 'lucide-react';

export default function TrainDetailPage() {
    const params = useParams();
    const router = useRouter();
    const trainId = params.id;

    const [train, setTrain] = useState(null);
    const [route, setRoute] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrainDetails = async () => {
            if (!trainId) return;

            setLoading(true);
            setError(null);

            try {
                const [trainData, routeData] = await Promise.all([
                    trainAPI.getById(trainId),
                    trainAPI.getRoute(trainId)
                ]);

                setTrain(trainData);
                setRoute(routeData || []);
            } catch (err) {
                console.error('Error fetching train details:', err);
                setError('Failed to load train details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainDetails();
    }, [trainId]);

    const handleStationSelect = (station) => {
        // Navigate to restaurants at this station
        router.push(`/restaurants?stationId=${station.stationId}&trainId=${trainId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
                    <p className="text-gray-600">Loading train details...</p>
                </div>
            </div>
        );
    }

    if (error || !train) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error || 'Train not found'}</p>
                        <button
                            onClick={() => router.back()}
                            className="btn-primary"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-24 pt-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Train className="w-8 h-8" />
                            </div>
                            <div>
                                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                                    {train.trainNumber}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {train.trainName}
                        </h1>
                        <div className="flex items-center gap-3 text-blue-100">
                            <MapPin className="w-5 h-5" />
                            <span className="font-medium">{train.source}</span>
                            <ArrowRight className="w-5 h-5" />
                            <span className="font-medium">{train.destination}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-16">
                <div>
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-orange-600" />
                            Train Route & Stations
                        </h2>

                        {route.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No route information available for this train.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-600 mb-6">
                                    Select a station to order food from restaurants available at that location.
                                </p>

                                {/* Route Timeline */}
                                <div className="relative">
                                    {route.map((stop, index) => (
                                        <div
                                            key={stop.id || index}
                                            onClick={() => handleStationSelect(stop)}
                                            className="relative flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 cursor-pointer transition-all group"
                                        >
                                            {/* Timeline Line */}
                                            {index < route.length - 1 && (
                                                <div className="absolute left-7 top-12 w-0.5 h-full bg-gray-200" />
                                            )}

                                            {/* Stop Number */}
                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0
                                                ? 'bg-green-500 text-white'
                                                : index === route.length - 1
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {stop.stopNumber || index + 1}
                                            </div>

                                            {/* Station Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                            {stop.stationName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {stop.stationCode}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {/* Arrival/Departure Times */}
                                                        <div className="text-right text-sm">
                                                            {stop.scheduledArrival && (
                                                                <p className="text-gray-600">
                                                                    <span className="text-gray-400">Arr:</span> {stop.scheduledArrival}
                                                                </p>
                                                            )}
                                                            {stop.scheduledDeparture && (
                                                                <p className="text-gray-600">
                                                                    <span className="text-gray-400">Dep:</span> {stop.scheduledDeparture}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Platform */}
                                                        {stop.platformNumber && (
                                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                                                                PF {stop.platformNumber}
                                                            </span>
                                                        )}

                                                        {/* Order Button */}
                                                        <button className="bg-orange-100 text-orange-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            <Utensils className="w-4 h-4" />
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Distance Info */}
                                                {stop.distanceFromSource > 0 && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {stop.distanceFromSource} km from source
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="btn-secondary"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/restaurants')}
                                className="btn-primary"
                            >
                                Browse All Restaurants
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
