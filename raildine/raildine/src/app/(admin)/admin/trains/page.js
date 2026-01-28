"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Train, MapPin, Trash2, Edit2, Loader2 } from 'lucide-react';
import { trainAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function AdminTrainsPage() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTrain, setNewTrain] = useState({ trainNumber: '', trainName: '', source: '', destination: '', departureTime: '', arrivalTime: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Fetch trains from database
    const fetchTrains = async () => {
        try {
            setLoading(true);
            const data = await trainAPI.getAll();
            setTrains(data);
        } catch (error) {
            console.error("Failed to fetch trains:", error);
            toast.error("Failed to load trains");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    const filteredTrains = trains.filter(train =>
        (train.trainName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (train.trainNumber || '').includes(searchTerm) ||
        (train.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (train.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this train from the database?')) {
            return;
        }
        try {
            await trainAPI.delete(id);
            toast.success("Train deleted successfully");
            fetchTrains();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete train");
        }
    };

    const handleEdit = (train) => {
        setEditId(train.id);
        setNewTrain({
            trainNumber: train.trainNumber || '',
            trainName: train.trainName || '',
            source: train.source || '',
            destination: train.destination || '',
            departureTime: train.departureTime || '',
            arrivalTime: train.arrivalTime || ''
        });
        setIsAddModalOpen(true);
    };

    const handleSaveTrain = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editId) {
                await trainAPI.update(editId, newTrain);
                toast.success("Train updated successfully");
            } else {
                await trainAPI.create(newTrain);
                toast.success("Train added successfully");
            }
            fetchTrains();
            setIsAddModalOpen(false);
            setNewTrain({ trainNumber: '', trainName: '', source: '', destination: '', departureTime: '', arrivalTime: '' });
            setEditId(null);
        } catch (error) {
            console.error("Save failed:", error);
            toast.error(editId ? "Failed to update train" : "Failed to add train");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Train Management</h1>
                        <p className="text-gray-500 mt-1">Manage train database and routes</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Train
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search trains by name or number..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Trains Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrains.map((train) => (
                        <div key={train.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Train className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(train)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(train.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{train.trainName}</h3>
                            <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mb-4">
                                #{train.trainNumber}
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="truncate">{train.source} - {train.destination}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase">Departs</p>
                                        <p className="font-medium text-gray-900">{train.departureTime || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs uppercase">Arrives</p>
                                        <p className="font-medium text-gray-900">{train.arrivalTime || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTrains.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                        {searchTerm ? `No trains found matching '${searchTerm}'` : 'No trains in database. Add one to get started.'}
                    </div>
                )}

                {/* Add/Edit Train Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{editId ? 'Edit Train' : 'Add New Train'}</h2>
                            <form onSubmit={handleSaveTrain} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Train Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                        value={newTrain.trainNumber}
                                        onChange={e => setNewTrain({ ...newTrain, trainNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Train Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                        value={newTrain.trainName}
                                        onChange={e => setNewTrain({ ...newTrain, trainName: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                            value={newTrain.source}
                                            onChange={e => setNewTrain({ ...newTrain, source: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                            value={newTrain.destination}
                                            onChange={e => setNewTrain({ ...newTrain, destination: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                            value={newTrain.departureTime}
                                            onChange={e => setNewTrain({ ...newTrain, departureTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                                            value={newTrain.arrivalTime}
                                            onChange={e => setNewTrain({ ...newTrain, arrivalTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setEditId(null);
                                            setNewTrain({ trainNumber: '', trainName: '', source: '', destination: '', departureTime: '', arrivalTime: '' });
                                        }}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : (editId ? 'Update Train' : 'Add Train')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}