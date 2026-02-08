"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, X, Edit2, Camera, Loader2, Store, Clock, MapPin, Power, PlusCircle, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI, restaurantAPI, stationAPI, fileAPI } from '@/services/api';

export default function VendorProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState(null);
    const [stations, setStations] = useState([]);

    const [profile, setProfile] = useState({
        id: '',
        username: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        roles: []
    });

    const [restaurant, setRestaurant] = useState(null);
    const [tempProfile, setTempProfile] = useState(profile);
    const [tempRestaurant, setTempRestaurant] = useState(null);

    // Initial Empty Restaurant State for Creation
    const initialRestaurantState = {
        name: '',
        description: '',
        cuisine: 'North Indian',
        deliveryTime: '30-45 min',
        imageUrl: '',
        stationId: '',
        active: true
    };

    const [newRestaurant, setNewRestaurant] = useState(initialRestaurantState);

    // Fetch profile and restaurant data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch User Profile
                const profileData = await userAPI.getProfile();
                setProfile(profileData);
                setTempProfile(profileData);

                // Fetch Vendor's Restaurant
                const restaurantsData = await restaurantAPI.getMyRestaurants();
                if (restaurantsData && restaurantsData.length > 0) {
                    setRestaurant(restaurantsData[0]); // Assuming single restaurant for now
                    setTempRestaurant(restaurantsData[0]);
                }

                // Fetch Stations for dropdown
                const stationsData = await stationAPI.getAll();
                setStations(stationsData);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updateData = {
                fullName: tempProfile.fullName,
                email: tempProfile.email,
                phoneNumber: tempProfile.phoneNumber
            };

            const updated = await userAPI.updateProfile(updateData);
            setProfile(updated);

            if (updateProfile) {
                await updateProfile(updateData);
            }

            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRestaurant = async () => {
        if (!restaurant) return;
        setSaving(true);
        try {
            const updateData = {
                name: tempRestaurant.name,
                description: tempRestaurant.description,
                cuisine: tempRestaurant.cuisine,
                deliveryTime: tempRestaurant.deliveryTime,
                imageUrl: tempRestaurant.imageUrl,
                stationId: tempRestaurant.stationId
                // Active status handles separately or included if backend supports
            };

            const updated = await restaurantAPI.update(restaurant.id, updateData);
            setRestaurant(updated);
            setTempRestaurant(updated);
            setIsEditingRestaurant(false);
            alert("Restaurant updated successfully!");
        } catch (err) {
            console.error('Failed to update restaurant:', err);
            alert('Failed to update restaurant: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!newRestaurant.stationId) {
                throw new Error("Please select a station");
            }

            const created = await restaurantAPI.create(newRestaurant);
            setRestaurant(created);
            setTempRestaurant(created);
            setIsCreatingRestaurant(false);
            alert("Restaurant created successfully!");
        } catch (err) {
            console.error('Failed to create restaurant:', err);
            alert('Failed to create restaurant: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, isNew = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const uploaded = await fileAPI.upload(file);
            console.log("Uploaded file:", uploaded);

            if (isNew) {
                setNewRestaurant(prev => ({ ...prev, imageUrl: uploaded.fileDownloadUri }));
            } else {
                setTempRestaurant(prev => ({ ...prev, imageUrl: uploaded.fileDownloadUri }));
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload image: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const toggleRestaurantStatus = async () => {
        if (!restaurant) return;
        // Optimistic UI update
        const newStatus = !restaurant.active;
        setRestaurant({ ...restaurant, active: newStatus });

        try {
            // We use the same update endpoint, backend logic handles 'active' if passed
            // The logic was recently updated in backend to handle 'active' field
            const updateData = {
                ...restaurant,
                active: newStatus
            };

            await restaurantAPI.update(restaurant.id, updateData);
            setTempRestaurant({ ...tempRestaurant, active: newStatus });

        } catch (err) {
            console.error('Failed to toggle status:', err);
            alert('Failed to update status: ' + err.message);
            // Revert on error
            setRestaurant({ ...restaurant, active: !newStatus });
        }
    };

    const handleCancelProfile = () => {
        setTempProfile({ ...profile });
        setIsEditing(false);
    };

    const handleCancelRestaurant = () => {
        setTempRestaurant({ ...restaurant });
        setIsEditingRestaurant(false);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-500">Loading profile...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* User Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-orange-600 overflow-hidden border-4 border-white/20 shadow-lg">
                                <span>{profile.fullName?.charAt(0) || profile.username?.charAt(0) || 'V'}</span>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">{profile.fullName || profile.username}</h1>
                            <p className="opacity-90">@{profile.username}</p>
                            <div className="flex gap-2 mt-1">
                                {profile.roles?.map(role => (
                                    <span key={role} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                        {role.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                            {isEditing ? (
                                <div className="flex space-x-2">
                                    <button onClick={handleSaveProfile} disabled={saving} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center">
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save
                                    </button>
                                    <button onClick={handleCancelProfile} disabled={saving} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition flex items-center">
                                        <X className="w-3 h-3 mr-1" /> Cancel
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center">
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Full Name</label>
                                {isEditing ? (
                                    <input type="text" className="input-field w-full py-1.5 text-sm" value={tempProfile.fullName || ''} onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })} />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{profile.fullName || 'Not set'}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Email</label>
                                {isEditing ? (
                                    <input type="email" className="input-field w-full py-1.5 text-sm" value={tempProfile.email || ''} onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })} />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Phone</label>
                                {isEditing ? (
                                    <input type="tel" className="input-field w-full py-1.5 text-sm" value={tempProfile.phoneNumber || ''} onChange={(e) => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })} />
                                ) : (
                                    <p className="text-sm font-medium text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Profile Section */}
            {restaurant ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Store className="w-5 h-5 text-orange-600" />
                            <h2 className="text-lg font-bold text-gray-900">Restaurant Settings</h2>
                        </div>
                        {isEditingRestaurant ? (
                            <div className="flex space-x-2">
                                <button onClick={handleSaveRestaurant} disabled={saving} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center">
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save
                                </button>
                                <button onClick={handleCancelRestaurant} disabled={saving} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition flex items-center">
                                    <X className="w-3 h-3 mr-1" /> Cancel
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditingRestaurant(true)} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center">
                                <Edit2 className="w-3 h-3 mr-1" /> Edit Details
                            </button>
                        )}
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Image Preview & Toggle */}
                            <div className="w-full md:w-1/3">
                                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100 group">
                                    <img
                                        src={isEditingRestaurant ? tempRestaurant.imageUrl : restaurant.imageUrl}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80'}
                                    />
                                    {isEditingRestaurant && (
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                            {uploadingImage ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 text-white mb-2" />
                                                    <p className="text-white text-xs font-medium">Click to upload image</p>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                        </label>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={toggleRestaurantStatus}
                                        disabled={isEditingRestaurant}
                                        className={`w-full px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all shadow-sm ${restaurant.active
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'}`}
                                    >
                                        <Power className="w-4 h-4 mr-2" />
                                        {restaurant.active ? 'OPEN FOR ORDERS' : 'CLOSED TEMPORARILY'}
                                    </button>
                                    <p className="text-xs text-center text-gray-400 mt-2">Click to toggle status</p>
                                </div>
                            </div>

                            {/* Details Form */}
                            <div className="w-full md:w-2/3 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Restaurant Name</label>
                                        {isEditingRestaurant ? (
                                            <input type="text" className="input-field w-full py-1.5 text-sm" value={tempRestaurant.name || ''} onChange={(e) => setTempRestaurant({ ...tempRestaurant, name: e.target.value })} />
                                        ) : (
                                            <p className="text-lg font-bold text-gray-900">{restaurant.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Cuisine Type</label>
                                        {isEditingRestaurant ? (
                                            <input type="text" className="input-field w-full py-1.5 text-sm" value={tempRestaurant.cuisine || ''} onChange={(e) => setTempRestaurant({ ...tempRestaurant, cuisine: e.target.value })} />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900">{restaurant.cuisine}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Description</label>
                                    {isEditingRestaurant ? (
                                        <textarea className="input-field w-full py-1.5 text-sm h-20 resize-none" value={tempRestaurant.description || ''} onChange={(e) => setTempRestaurant({ ...tempRestaurant, description: e.target.value })} />
                                    ) : (
                                        <p className="text-sm text-gray-600 leading-relaxed">{restaurant.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Delivery Time (mins)</label>
                                        {isEditingRestaurant ? (
                                            <input type="text" className="input-field w-full py-1.5 text-sm" value={tempRestaurant.deliveryTime || ''} onChange={(e) => setTempRestaurant({ ...tempRestaurant, deliveryTime: e.target.value })} />
                                        ) : (
                                            <div className="flex items-center text-sm font-medium text-gray-900">
                                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                {restaurant.deliveryTime}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Station</label>
                                        {isEditingRestaurant ? (
                                            <select
                                                className="input-field w-full py-1.5 text-sm bg-white"
                                                value={tempRestaurant.stationId || ''}
                                                onChange={(e) => setTempRestaurant({ ...tempRestaurant, stationId: e.target.value })}
                                            >
                                                {stations.map(s => (
                                                    <option key={s.id} value={s.id}>{s.stationName} ({s.stationCode})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 flex items-center">
                                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                {restaurant.stationName || stations.find(s => s.id === restaurant.stationId)?.stationName || 'Loading...'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isEditingRestaurant && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">Image URL (or upload above)</label>
                                        <input type="text" className="input-field w-full py-1.5 text-sm" value={tempRestaurant.imageUrl || ''} onChange={(e) => setTempRestaurant({ ...tempRestaurant, imageUrl: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    {!isCreatingRestaurant ? (
                        <>
                            <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Start Your Business</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't linked a restaurant yet. Create your restaurant profile now to start accepting orders from train passengers.</p>
                            <button
                                onClick={() => setIsCreatingRestaurant(true)}
                                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex items-center mx-auto"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Register Restaurant
                            </button>
                        </>
                    ) : (
                        <div className="max-w-lg mx-auto text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Store className="w-6 h-6 mr-2 text-orange-600" />
                                Create Restaurant Profile
                            </h3>
                            <form onSubmit={handleCreateRestaurant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                                    <input type="text" required className="input-field w-full" placeholder="e.g. Royal Punjab Dhaba" value={newRestaurant.name} onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                                        <input type="text" required className="input-field w-full" placeholder="e.g. North Indian" value={newRestaurant.cuisine} onChange={e => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                                        <input type="text" required className="input-field w-full" placeholder="e.g. 30-40 min" value={newRestaurant.deliveryTime} onChange={e => setNewRestaurant({ ...newRestaurant, deliveryTime: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Station</label>
                                    <select
                                        required
                                        className="input-field w-full bg-white"
                                        value={newRestaurant.stationId}
                                        onChange={e => setNewRestaurant({ ...newRestaurant, stationId: e.target.value })}
                                    >
                                        <option value="">-- Choose a Station --</option>
                                        {stations.map(s => (
                                            <option key={s.id} value={s.id}>{s.stationName} ({s.stationCode})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea className="input-field w-full h-24 resize-none" placeholder="Tell us about your restaurant..." value={newRestaurant.description} onChange={e => setNewRestaurant({ ...newRestaurant, description: e.target.value })}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (or upload)</label>

                                    <div className="flex gap-2">
                                        <input type="text" className="input-field w-full" placeholder="https://example.com/image.jpg" value={newRestaurant.imageUrl} onChange={e => setNewRestaurant({ ...newRestaurant, imageUrl: e.target.value })} />
                                        <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition flex items-center">
                                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploadingImage} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button type="submit" disabled={saving} className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition">
                                        {saving ? 'Creating...' : 'Create Restaurant'}
                                    </button>
                                    <button type="button" onClick={() => setIsCreatingRestaurant(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
