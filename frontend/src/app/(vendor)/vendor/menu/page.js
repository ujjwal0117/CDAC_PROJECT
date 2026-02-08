"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Power, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { restaurantAPI, foodItemAPI, fileAPI } from '@/services/api';

export default function MenuPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [foodItems, setFoodItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const initialFormState = {
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        imageUrl: '',
        vegetarian: true,
        available: true
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Get Vendor's Restaurant
                const restaurants = await restaurantAPI.getMyRestaurants();
                if (!restaurants || restaurants.length === 0) {
                    setLoading(false);
                    return;
                }
                const myRestaurant = restaurants[0];
                setRestaurant(myRestaurant);

                // 2. Get Food Items for this restaurant
                const items = await foodItemAPI.getByRestaurant(myRestaurant.id);
                setFoodItems(items);
            } catch (err) {
                console.error("Failed to fetch menu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                imageUrl: item.imageUrl,
                vegetarian: item.vegetarian,
                available: item.available
            });
            setImagePreview(item.imageUrl);
        } else {
            setEditingItem(null);
            setFormData(initialFormState);
            setImagePreview('');
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        // Create a local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!restaurant) return alert("No restaurant found!");

        setSaving(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                restaurantId: restaurant.id
            };

            let savedItem;
            if (editingItem) {
                savedItem = await foodItemAPI.update(editingItem.id, payload);
            } else {
                savedItem = await foodItemAPI.create(payload);
            }

            // If a new file was selected, upload it to store in DB
            if (selectedFile) {
                try {
                    setUploading(true); // Set uploading state for the actual upload
                    const withImage = await foodItemAPI.uploadImage(savedItem.id, selectedFile);
                    savedItem = withImage;
                } catch (imgErr) {
                    console.error("Image upload failed:", imgErr);
                    alert("Item saved, but image upload failed.");
                } finally {
                    setUploading(false);
                }
            }

            if (editingItem) {
                setFoodItems(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
            } else {
                setFoodItems(prev => [...prev, savedItem]);
            }

            setIsModalOpen(false);
        } catch (err) {
            alert('Failed to save item: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await foodItemAPI.delete(id);
            setFoodItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            alert("Failed to delete: " + err.message);
        }
    };

    const toggleAvailability = async (item) => {
        try {
            // Optimistic update
            const updatedItem = { ...item, available: !item.available };
            setFoodItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));

            await foodItemAPI.update(item.id, { ...item, available: !item.available, restaurantId: restaurant.id });
        } catch (err) {
            // Revert on failure
            setFoodItems(prev => prev.map(i => i.id === item.id ? item : i));
            alert("Failed to update status");
        }
    };

    const filteredItems = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>;

    if (!restaurant) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-gray-800">No Restaurant Found</h2>
            <p className="text-gray-500 mt-2">Please create your restaurant profile first.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center font-medium shadow-sm"
                >
                    <PlusCircle className="w-5 h-5 mr-2" /> Add New Item
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-400"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className={`bg-white rounded-xl border ${item.available ? 'border-gray-200' : 'border-gray-200 opacity-75'} shadow-sm overflow-hidden group hover:shadow-md transition-all`}>
                        <div className="h-48 overflow-hidden relative bg-gray-100">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${item.imageUrl}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.vegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.vegetarian ? 'VEG' : 'NON-VEG'}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1" title={item.name}>{item.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium">{item.category}</p>
                                </div>
                                <span className="font-bold text-orange-600">₹{item.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{item.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleAvailability(item)}
                                    className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                >
                                    <Power className="w-3 h-3 mr-1.5" />
                                    {item.available ? 'Active' : 'Hidden'}
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No food items found. Add your first dish!</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                            <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input type="text" required className="input-field w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input type="number" required min="1" className="input-field w-full" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="input-field w-full bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Main Course</option>
                                        <option>Starters</option>
                                        <option>Desserts</option>
                                        <option>Beverages</option>
                                        <option>Combo</option>
                                        <option>Breads</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="input-field w-full h-20 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <div className="flex gap-2">
                                    <input type="text" className="input-field w-full" placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                                    <label className="bg-gray-100 hover:bg-gray-200 px-3 rounded-lg border border-gray-300 flex items-center cursor-pointer transition">
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 text-gray-600" />}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" checked={formData.vegetarian} onChange={e => setFormData({ ...formData, vegetarian: e.target.checked })} />
                                    <span className="text-sm font-medium text-gray-700">Vegetarian (Green Dot)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} />
                                    <span className="text-sm font-medium text-gray-700">Available to Order</span>
                                </label>
                            </div>

                            <button type="submit" disabled={saving || uploading} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200 mt-4 disabled:opacity-70">
                                {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
