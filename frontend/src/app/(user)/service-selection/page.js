"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { trainAPI } from '@/services/api';

export default function ServiceSelection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pnr = searchParams.get('pnr') || '';
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pnrData, setPnrData] = useState(null);

    useEffect(() => {
        const fetchPnrData = async () => {
            if (!pnr) {
                setError('No PNR provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                const data = await trainAPI.getByPnr(pnr);
                setPnrData(data);
            } catch (err) {
                console.error('PNR lookup error:', err);
                setError(err.message || 'Failed to fetch PNR details');
            } finally {
                setLoading(false);
            }
        };

        fetchPnrData();
    }, [pnr]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-600">Looking up PNR {pnr}...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">PNR Not Found</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-primary"
                        >
                            Go Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const route = pnrData?.route || [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Navbar />

            {/* Train Info Banner */}
            <div className="bg-[#1a202c] text-white py-8 px-4 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {pnrData?.trainName} ({pnrData?.trainNumber})
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-300 text-sm md:text-base">
                            <span>PNR: <span className="text-white font-mono font-bold">{pnr}</span></span>
                            <span>•</span>
                            <span>Coach: <span className="text-white font-bold">{pnrData?.coachNumber}</span></span>
                            <span>•</span>
                            <span>Seat: <span className="text-white font-bold">{pnrData?.seatNumber}</span></span>
                        </div>
                        <div className="text-gray-400 text-sm mt-2">
                            {pnrData?.source} → {pnrData?.destination}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/pantry-menu?trainId=${pnrData?.trainId}`)}
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
                    <div className="text-center py-12 text-gray-500">
                        <p>No route information available for this train.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-dashed border-gray-300 ml-4 md:ml-8 space-y-12 pb-12">
                        {route.map((station, index) => {
                            const isStart = index === 0;
                            const isEnd = index === route.length - 1;
                            const halt = isStart ? 'Start' : isEnd ? 'End' : `${5 + (index % 3) * 5} min`;

                            return (
                                <div key={station.id} className="relative pl-8 md:pl-12">
                                    {/* Timeline Dot */}
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

                                        {/* Show View Restaurants for all stations */}
                                        <div className="w-full md:w-auto">
                                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center gap-6">
                                                <div className="hidden md:block text-gray-400 text-sm">
                                                    {station.stationCode}
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/restaurants?stationId=${station.stationId}`)}
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2 rounded-lg font-bold text-sm transition-colors"
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
