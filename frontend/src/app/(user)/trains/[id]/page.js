"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { trainAPI } from '@/services/api';
import { Train, MapPin, ArrowRight, Clock, Calendar, Loader2, AlertCircle, ChevronRight, Utensils, Coffee } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Navbar />

            {/* Train Info Banner - Matching ServiceSelection Style */}
            <div className="bg-[#1a202c] text-white py-8 px-4 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {train?.trainName} ({train?.trainNumber})
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-300 text-sm md:text-base">
                            <span className="flex items-center gap-1"><Train className="w-4 h-4" /> Train Details</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {train?.source} → {train?.destination}
                            </span>
                        </div>
                        <div className="text-gray-400 text-sm mt-3 flex items-center gap-4">
                            <span>PNR: <span className="text-white/60 italic">Not applicable</span></span>
                            <span>•</span>
                            <span>Coach/Seat: <span className="text-white/60 italic">N/A</span></span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/pantry-menu?trainId=${trainId}`)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold flex items-center transition-transform hover:scale-105 shadow-md"
                    >
                        <Coffee className="w-5 h-5 mr-2" /> Order from Pantry
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-500" /> Select Delivery Station
                </h2>

                {route.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p>No route information available for this train.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-dashed border-gray-300 ml-4 md:ml-8 space-y-12 pb-12">
                        {route.map((station, index) => {
                            const isStart = index === 0;
                            const isEnd = index === route.length - 1;
                            const halt = station?.halt || `${5 + (index % 3) * 5} min`;

                            return (
                                <div key={station.id || index} className="relative pl-8 md:pl-12">
                                    {/* Timeline Dot matching ServiceSelection */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white border-red-500`}></div>

                                    {/* Station Content */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 group">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-700">
                                                {station.stationName} <span className="text-gray-400 font-normal">({station.stationCode})</span>
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Arr: {station.scheduledArrival || 'N/A'}
                                                {station.platformNumber && <> • Platform: {station.platformNumber}</>}
                                                {!isStart && !isEnd && <> • Halt: {halt}</>}
                                            </div>
                                        </div>

                                        {/* View Restaurants Button matching ServiceSelection UI */}
                                        <div className="w-full md:w-auto">
                                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center gap-6">
                                                <div className="hidden md:block text-gray-400 text-sm font-mono">
                                                    {station.stationCode}
                                                </div>
                                                <button
                                                    onClick={() => handleStationSelect(station)}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                                                >
                                                    View Restaurants
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
