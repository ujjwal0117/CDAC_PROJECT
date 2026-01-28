
export const STATIONS = [
    { id: 1, name: 'New Delhi', code: 'NDLS', arrival: '14:30', platform: '5' },
    { id: 2, name: 'Kanpur Central', code: 'CNB', arrival: '19:45', platform: '3' },
    { id: 3, name: 'Allahabad', code: 'ALD', arrival: '22:15', platform: '2' },
    { id: 4, name: 'Varanasi', code: 'BSB', arrival: '02:30', platform: '4' }
];

export const TRAIN_ROUTE = [
    { id: 1, name: 'Mumbai Central', code: 'MMCT', arrival: '17:00', halt: 'Start', isStart: true },
    { id: 2, name: 'Surat', code: 'ST', arrival: '19:43', halt: '5 min', isStart: false },
    { id: 3, name: 'Vadodara Junction', code: 'BRC', arrival: '21:18', halt: '10 min', isStart: false },
    { id: 4, name: 'Ratlam Junction', code: 'RTM', arrival: '01:00', halt: '5 min', isStart: false },
    { id: 5, name: 'Kota Junction', code: 'KOTA', arrival: '04:00', halt: '10 min', isStart: false },
    { id: 6, name: 'New Delhi', code: 'NDLS', arrival: '08:30', halt: 'End', isStart: false }
];

export const RESTAURANTS = [
    { id: 1, name: 'Spice Junction', rating: 4.5, cuisine: 'North Indian', deliveryTime: '25-30 mins', image: '🍛', stationId: 1 },
    { id: 2, name: 'Biryani House', rating: 4.7, cuisine: 'Biryani & Mughlai', deliveryTime: '30-35 mins', image: '🍲', stationId: 2 },
    { id: 3, name: 'South Treats', rating: 4.3, cuisine: 'South Indian', deliveryTime: '20-25 mins', image: '🥘', stationId: 3 },
    { id: 4, name: 'Quick Bites', rating: 4.1, cuisine: 'Fast Food', deliveryTime: '15-20 mins', image: '🍔', stationId: 4 }
];

export const MENU_ITEMS = [
    { id: 101, name: 'Paneer Butter Masala', price: 180, desc: 'Rich & creamy curry', image: '🍛', veg: true },
    { id: 102, name: 'Dal Makhani', price: 150, desc: 'Black lentils in butter', image: '🥘', veg: true },
    { id: 103, name: 'Naan (2 pcs)', price: 40, desc: 'Soft butter naan', image: '🫓', veg: true },
    { id: 104, name: 'Chicken Tikka', price: 220, desc: 'Grilled chicken pieces', image: '🍗', veg: false }
];

export const MOCK_CUSTOMER_ORDERS = [
    { id: 'ORD001', restaurant: 'Spice Junction', items: 3, total: 450, status: 'delivered', date: '15 Nov 2025', station: 'New Delhi' },
    { id: 'ORD002', restaurant: 'Biryani House', items: 2, total: 380, status: 'preparing', date: '18 Nov 2025', station: 'Kanpur' }
];

export const MOCK_VENDOR_ORDERS = [
    { id: 'ORD101', customer: 'John Doe', items: 3, total: 450, status: 'pending', pnr: '1234567890', coach: 'A1', seat: '45', station: 'New Delhi', time: '14:30', currentLocation: 'New Delhi Platform 5' },
    { id: 'ORD102', customer: 'Jane Smith', items: 2, total: 280, status: 'preparing', pnr: '9876543210', coach: 'B2', seat: '12', station: 'Kanpur', time: '19:45', currentLocation: 'Approaching Aligarh' },
    { id: 'ORD103', customer: 'Mike Johnson', items: 4, total: 520, status: 'ready', pnr: '5555666677', coach: 'A3', seat: '8', station: 'New Delhi', time: '15:00', currentLocation: 'Crossing Tundla Junction' },
    { id: 'ORD104', customer: 'Sarah Williams', items: 1, total: 180, status: 'delivered', pnr: '1111222233', coach: 'C1', seat: '22', station: 'Allahabad', time: '22:15', currentLocation: 'Allahabad Junction' }
];

export const MOCK_VENDOR_MENU = [
    { id: 1, name: 'Paneer Butter Masala', price: 180, category: 'Main Course', available: true, sales: 145 },
    { id: 2, name: 'Dal Makhani', price: 150, category: 'Main Course', available: true, sales: 98 },
    { id: 3, name: 'Naan (2 pcs)', price: 40, category: 'Bread', available: true, sales: 210 },
    { id: 4, name: 'Chicken Tikka', price: 220, category: 'Appetizer', available: false, sales: 67 }
];

export const PANTRY_MENU = [
    { id: 201, name: 'Standard Veg Thali', price: 120, desc: 'Rice, Dal, Sabzi, Curd, Pickle', image: '🍱', veg: true },
    { id: 202, name: 'Standard Non-Veg Thali', price: 150, desc: 'Rice, Chicken Curry, Dal, Curd', image: '🍗', veg: false },
    { id: 203, name: 'Veg Biryani', price: 100, desc: 'Aromatic rice with vegetables', image: '🍚', veg: true },
    { id: 204, name: 'Egg Biryani', price: 120, desc: 'Biryani with 2 eggs', image: '🥚', veg: false },
    { id: 205, name: 'Tea / Coffee', price: 20, desc: 'Hot beverage', image: '☕', veg: true },
    { id: 206, name: 'Water Bottle', price: 15, desc: '1 Litre packaged water', image: '💧', veg: true }
];