"use client";

import React from 'react';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { orderAPI, restaurantAPI, userAPI } from '@/services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const RevenueChart = ({ revenueData }) => {
    // Determine max value for scaling (min 1000 to avoid div by zero)
    const maxValue = Math.max(...revenueData.map(d => d.value), 1000) * 1.2;

    if (revenueData.every(d => d.value === 0)) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No revenue data for the last 7 days
            </div>
        );
    }

    return (
        <div className="h-64 flex items-end justify-between gap-4 pt-10 px-4">
            {revenueData.map((item, index) => (
                <div key={item.day} className="flex flex-col items-center gap-2 group w-full">
                    <div className="relative w-full flex items-end justify-center h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ₹{item.value.toLocaleString()}
                        </div>
                        {/* Bar */}
                        <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-colors shadow-sm"
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                minHeight: item.value > 0 ? '4px' : '0'
                            }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{item.day}</span>
                </div>
            ))}
        </div>
    );
};

export default function AdminDashboardPage() {
    const [stats, setStats] = React.useState({
        totalOrders: 0,
        totalRevenue: "₹0",
        activeVendors: 0,
        activeCustomers: 0,
    });
    const [allOrders, setAllOrders] = React.useState([]);
    const [chartData, setChartData] = React.useState([]);
    const [timeRange, setTimeRange] = React.useState('7d'); // '7d' or '30d'
    const [loading, setLoading] = React.useState(true);

    // 1. Fetch Initial Data
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orders, vendors, users] = await Promise.all([
                    orderAPI.getAll(),
                    restaurantAPI.getAll(),
                    userAPI.getAll()
                ]);

                setAllOrders(orders);

                const totalOrders = orders.length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                const activeVendors = vendors.filter(v => v.active).length;
                const activeCustomers = users.length;

                setStats({
                    totalOrders,
                    totalRevenue: "₹" + totalRevenue.toLocaleString(),
                    activeVendors,
                    activeCustomers
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // 2. Calculate Chart Data when Orders or TimeRange changes
    React.useEffect(() => {
        if (!allOrders.length && !loading) { // Only proceed if orders are fetched or if loading is complete and there are no orders
            setChartData([]); // Clear chart if no orders
            return;
        }
        if (loading) return; // Don't calculate chart data if initial data is still loading

        const days = timeRange === '7d' ? 7 : 30;
        const dates = [...Array(days)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - ((days - 1) - i));
            return d;
        });

        const revenueData = dates.map(date => {
            // For 30 days, maybe show just date? For 7 days, show weekday?
            // Let's keep it simple: "Mon" or "12/05"
            // Actually for 30 days, "Mon" is repetitive. Let's use date.
            const dayName = timeRange === '7d'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            const dateStr = date.toLocaleDateString(); // Local date string for comparison

            const dayTotal = allOrders
                .filter(order => new Date(order.createdAt).toLocaleDateString() === dateStr)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            return { day: dayName, value: dayTotal };
        });

        setChartData(revenueData);
    }, [allOrders, timeRange, loading]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={loading ? "..." : stats.totalRevenue}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Orders"
                    value={loading ? "..." : stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Vendors"
                    value={loading ? "..." : stats.activeVendors}
                    icon={Activity}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Active Customers"
                    value={loading ? "..." : stats.activeCustomers}
                    icon={Users}
                    color="bg-purple-500"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
                    <select
                        className="text-sm border-gray-200 rounded-lg text-gray-500 focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <span className="text-gray-400">Loading chart...</span>
                    </div>
                ) : (
                    <RevenueChart revenueData={chartData} />
                )}
            </div>
        </div>
    );
}
