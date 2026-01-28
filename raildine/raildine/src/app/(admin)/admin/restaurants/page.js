"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { restaurantAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function AdminRestaurantsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchVendors = async () => {
        try {
            setLoading(true);
            // Fetch both lists
            const [activeData, pendingData] = await Promise.all([
                restaurantAPI.getAll(),
                restaurantAPI.getPending()
            ]);

            // Combine and format data
            // Note: API returns isApproved=true for getAll, and isApproved=false for getPending
            // We need to map them to unique list

            const activeList = activeData.map(v => ({
                ...v,
                status: v.active ? 'active' : 'suspended',
                ownerName: v.ownerName || "Unknown Vendor",
                email: v.ownerEmail || "N/A"
            }));

            const pendingList = pendingData.map(v => ({
                ...v,
                status: 'pending',
                ownerName: v.ownerName || "Pending Applicant",
                email: v.ownerEmail || "N/A"
            }));

            // Combine handling duplicates (using Map to ensure unique IDs)
            const combinedMap = new Map();
            [...activeList, ...pendingList].forEach(v => {
                combinedMap.set(v.id, v);
            });
            const combined = Array.from(combinedMap.values());
            setVendors(combined);
        } catch (err) {
            console.error("Failed to fetch vendors:", err);
            setError("Failed to load vendor data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleApprove = async (id) => {
        try {
            await restaurantAPI.approve(id);
            toast.success("Restaurant approved successfully");
            fetchVendors(); // Refresh list
        } catch (err) {
            console.error("Approval failed:", err);
            toast.error("Failed to approve restaurant");
        }
    };

    const handleDelete = async (id, actionType) => {
        if (!confirm(`Are you sure you want to ${actionType} this vendor? This action cannot be undone.`)) {
            return;
        }

        try {
            await restaurantAPI.delete(id);
            toast.success(actionType === 'reject' ? "Application rejected" : "Vendor deleted");
            fetchVendors(); // Refresh list
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete vendor");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const vendor = vendors.find(v => v.id === id);
        if (!vendor) return;

        // Handle pending → active (approval)
        if (vendor.status === 'pending' && newStatus === 'active') {
            handleApprove(id);
            return;
        }

        // Handle suspend/reactivate for approved vendors
        if (newStatus === 'suspended' || newStatus === 'active') {
            const action = newStatus === 'suspended' ? 'suspend' : 'reactivate';
            if (!confirm(`Are you sure you want to ${action} ${vendor.name}?`)) {
                return;
            }
            try {
                await restaurantAPI.update(id, {
                    name: vendor.name,
                    description: vendor.description || '',
                    cuisine: vendor.cuisine || '',
                    deliveryTime: vendor.deliveryTime || '30-45 mins',
                    imageUrl: vendor.imageUrl || '',
                    stationId: vendor.stationId || vendor.station?.id,
                    active: newStatus === 'active'
                });
                toast.success(`Vendor ${action === 'suspend' ? 'suspended' : 'reactivated'} successfully`);
                fetchVendors();
            } catch (err) {
                console.error(`Failed to ${action} vendor:`, err);
                toast.error(`Failed to ${action} vendor`);
            }
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesStatus = filterStatus === "all" || vendor.status === filterStatus;
        const matchesSearch = (vendor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                        <p className="text-gray-500 mt-1">Manage restaurant partners and their account status</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[150px]">
                            <p className="text-sm text-gray-500">Total Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[150px]">
                            <p className="text-sm text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {vendors.filter(v => v.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Filter className="text-gray-400 h-5 w-5" />
                        <select
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Restaurant Details</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Rating</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{vendor.name}</p>
                                                <p className="text-xs text-gray-500">ID: #{vendor.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{vendor.stationName || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{vendor.stationCode}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(vendor.status)}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <p className="flex items-center text-yellow-600">
                                                    <span className="mr-1">★</span> {vendor.rating > 0 ? vendor.rating : 'New'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {vendor.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(vendor.id)}
                                                            className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors tooltip"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(vendor.id, 'reject')}
                                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors tooltip"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(vendor.id, 'delete')}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors tooltip group"
                                                        title="Delete Vendor"
                                                    >
                                                        <span className="text-xs font-medium mr-2 hidden group-hover:inline">Delete</span>
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredVendors.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No vendors found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}