"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { STATIONS } from '@/utils/constants';

export default function TrainsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pnr = searchParams.get('pnr');

    // Mock Train Details
    const trainDetails = {
        trainNo: '12301',
        trainName: 'Rajdhani Express',
        from: 'New Delhi',
        to: 'Howrah',
        date: '18 Nov 2025',
        coach: 'A1',
        seat: '45'
    };

    const handleStationSelect = (stationId) => {
        router.push(`/restaurants?stationId=${stationId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {trainDetails && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Train Details</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                            <div><span className="font-semibold text-gray-900">Train:</span> {trainDetails.trainNo} - {trainDetails.trainName}</div>
                            <div><span className="font-semibold text-gray-900">Date:</span> {trainDetails.date}</div>
                            <div><span className="font-semibold text-gray-900">From:</span> {trainDetails.from}</div>
                            <div><span className="font-semibold text-gray-900">Seat:</span> {trainDetails.coach} - {trainDetails.seat}</div>
                        </div>
                    </div>
                )}

                <h2 className="text-3xl font-bold mb-6 text-gray-900">Select Delivery Station</h2>
                <div className="space-y-4">
                    {STATIONS.map(station => (
                        <div
                            key={station.id}
                            onClick={() => handleStationSelect(station.id)}
                            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{station.name}</h3>
                                    <p className="text-gray-600">Station Code: {station.code}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {station.arrival}</span>
                                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Platform {station.platform}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}