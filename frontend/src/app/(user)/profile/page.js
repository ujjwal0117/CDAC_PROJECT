"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { User, Mail, Phone, Edit2, Save, LogOut, Shield, Heart, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { passengerAPI } from '@/services/api';

export default function ProfilePage() {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile form state
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        preference: 'Non-Veg'
    });

    // Passengers state
    const [passengers, setPassengers] = useState([]);
    const [loadingPassengers, setLoadingPassengers] = useState(true);
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [editingPassenger, setEditingPassenger] = useState(null);
    const [passengerForm, setPassengerForm] = useState({ name: '', age: '', gender: 'Male' });
    const [savingPassenger, setSavingPassenger] = useState(false);

    // Initialize profile from user data
    useEffect(() => {
        if (user) {
            setProfile({
                fullName: user.fullName || user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || user.phone || '',
                preference: 'Non-Veg'
            });
        }
    }, [user]);

    // Fetch passengers on mount
    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            setLoadingPassengers(true);
            const data = await passengerAPI.getAll();
            setPassengers(data);
        } catch (err) {
            console.error('Failed to fetch passengers:', err);
        } finally {
            setLoadingPassengers(false);
        }
    };

    const handleSaveProfile = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await updateProfile({
                fullName: profile.fullName,
                email: profile.email,
                phoneNumber: profile.phoneNumber
            });
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const openAddPassengerModal = () => {
        setEditingPassenger(null);
        setPassengerForm({ name: '', age: '', gender: 'Male' });
        setShowPassengerModal(true);
    };

    const openEditPassengerModal = (passenger) => {
        setEditingPassenger(passenger);
        setPassengerForm({
            name: passenger.name,
            age: passenger.age?.toString() || '',
            gender: passenger.gender || 'Male'
        });
        setShowPassengerModal(true);
    };

    const handleSavePassenger = async () => {
        if (!passengerForm.name.trim()) {
            return;
        }

        setSavingPassenger(true);
        try {
            const data = {
                name: passengerForm.name,
                age: passengerForm.age ? parseInt(passengerForm.age) : null,
                gender: passengerForm.gender
            };

            if (editingPassenger) {
                await passengerAPI.update(editingPassenger.id, data);
            } else {
                await passengerAPI.add(data);
            }

            await fetchPassengers();
            setShowPassengerModal(false);
        } catch (err) {
            console.error('Failed to save passenger:', err);
        } finally {
            setSavingPassenger(false);
        }
    };

    const handleDeletePassenger = async (passengerId) => {
        if (!confirm('Are you sure you want to delete this passenger?')) return;

        try {
            await passengerAPI.delete(passengerId);
            await fetchPassengers();
        } catch (err) {
            console.error('Failed to delete passenger:', err);
        }
    };

    const getJoinDate = () => {
        if (user?.createdAt) {
            const date = new Date(user.createdAt);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        return 'Member';
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <User className="w-12 h-12" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 px-8 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName || 'User'}</h1>
                                <p className="text-gray-500">Gold Member • Joined {getJoinDate()}</p>
                            </div>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                disabled={saving}
                                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${isEditing
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>

                        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
                        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-orange-600" /> Personal Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                                        {isEditing ? (
                                            <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" />
                                        ) : (
                                            <p className="font-medium text-gray-900">{profile.fullName || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Email Address</label>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                            {isEditing ? (
                                                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" />
                                            ) : (
                                                <p className="font-medium text-gray-900">{profile.email || 'Not set'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Phone Number</label>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                            {isEditing ? (
                                                <input type="text" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" />
                                            ) : (
                                                <p className="font-medium text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Food Preference</label>
                                        {isEditing ? (
                                            <select value={profile.preference} onChange={(e) => setProfile({ ...profile, preference: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none">
                                                <option>Veg</option>
                                                <option>Non-Veg</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${profile.preference === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile.preference}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Saved Passengers */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <Heart className="w-5 h-5 mr-2 text-orange-600" /> Saved Passengers
                                </h2>
                                <div className="space-y-3">
                                    {loadingPassengers ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        </div>
                                    ) : passengers.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500">
                                            <p>No passengers saved yet.</p>
                                        </div>
                                    ) : (
                                        passengers.map(passenger => (
                                            <div key={passenger.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-900">{passenger.name}</p>
                                                    <p className="text-sm text-gray-500">{passenger.age} yrs • {passenger.gender}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => openEditPassengerModal(passenger)} className="text-orange-600 text-sm font-semibold hover:underline">Edit</button>
                                                    <button onClick={() => handleDeletePassenger(passenger.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <button onClick={openAddPassengerModal} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center">
                                        <Plus className="w-4 h-4 mr-2" /> Add New Passenger
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <button onClick={logout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center">
                                        <LogOut className="w-5 h-5 mr-2" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Passenger Modal */}
            {showPassengerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingPassenger ? 'Edit Passenger' : 'Add Passenger'}</h3>
                            <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={passengerForm.name} onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Enter name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input type="number" value={passengerForm.age} onChange={(e) => setPassengerForm({ ...passengerForm, age: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Enter age" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select value={passengerForm.gender} onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button onClick={() => setShowPassengerModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                            <button onClick={handleSavePassenger} disabled={savingPassenger || !passengerForm.name.trim()} className={`flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition ${(savingPassenger || !passengerForm.name.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {savingPassenger ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
