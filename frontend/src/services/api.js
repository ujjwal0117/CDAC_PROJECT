/**
 * API Service for backend communication
 * Handles authentication and HTTP requests to Spring Boot backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Get the stored JWT token from localStorage
 */
export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

/**
 * Store JWT token in localStorage
 */
export const setToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

/**
 * Store user data in localStorage
 */
export const setUserData = (user) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
    if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
    return null;
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        // Handle validation errors (Spring Boot format)
        if (data.errors) {
            const errorMessages = Object.values(data.errors).join(', ');
            throw new Error(errorMessages || data.message || 'Validation failed');
        }

        // Handle auth errors - maybe broadcast an event or clear token if 401?
        if (response.status === 401) {
            // Optional: Auto-logout logic could go here
            // removeToken();
            // window.location.href = '/login'; 
            // But let's just let the caller handle it for now
        }

        throw new Error(data.message || data.error || 'Something went wrong');
    }

    return data;
};

/**
 * Auth API Methods
 */
export const authAPI = {
    /**
     * Login user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<AuthResponse>}
     */
    login: async (username, password) => {
        return apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    /**
     * Register a new customer
     * @param {Object} data - { username, email, password, fullName, phoneNumber }
     * @returns {Promise<AuthResponse>}
     */
    register: async (data) => {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                role: 'customer'
            }),
        });
    },

    /**
     * Register a new vendor
     * @param {Object} data 
     * @returns {Promise<AuthResponse>}
     */
    registerVendor: async (data) => {
        return apiRequest('/api/auth/register/vendor', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },


};

/**
 * Train API Methods
 */
export const trainAPI = {
    /**
     * Get all trains
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/trains', { method: 'GET' });
    },

    /**
     * Get train by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        return apiRequest(`/api/trains/${id}`, { method: 'GET' });
    },

    /**
     * Get train info by PNR number
     * @param {string} pnrNumber 
     * @returns {Promise<PnrResponse>}
     */
    getByPnr: async (pnrNumber) => {
        return apiRequest(`/api/trains/pnr/${pnrNumber}`, { method: 'GET' });
    },

    /**
     * Get route (stations) for a train
     * @param {number} trainId 
     * @returns {Promise<Array>}
     */
    getRoute: async (trainId) => {
        return apiRequest(`/api/trains/${trainId}/route`, { method: 'GET' });
    },

    /**
     * Search trains by name
     * @param {string} query - Search query (min 2 chars)
     * @returns {Promise<Array>}
     */
    searchByName: async (query) => {
        return apiRequest(`/api/trains/search/name?q=${encodeURIComponent(query)}`, { method: 'GET' });
    },

    /**
     * Search trains by number
     * @param {string} query - Train number to search
     * @returns {Promise<Array>}
     */
    searchByNumber: async (query) => {
        return apiRequest(`/api/trains/search/number?q=${encodeURIComponent(query)}`, { method: 'GET' });
    },

    /**
     * Create a new train
     * @param {Object} data - TrainRequest
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        return apiRequest('/api/trains', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a train
     * @param {number} id - Train ID
     * @param {Object} data - TrainRequest
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        return apiRequest(`/api/trains/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a train
     * @param {number} id - Train ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        return apiRequest(`/api/trains/${id}`, { method: 'DELETE' });
    },
};

/**
 * Station API Methods
 */
export const stationAPI = {
    /**
     * Get all stations
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/stations', { method: 'GET' });
    },

    /**
     * Get station by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        return apiRequest(`/api/stations/${id}`, { method: 'GET' });
    },
};

/**
 * User Profile API Methods
 */
export const userAPI = {
    /**
     * Get current user's profile
     * @returns {Promise<ProfileResponse>}
     */
    getProfile: async () => {
        return apiRequest('/api/users/profile', { method: 'GET' });
    },

    /**
     * Update current user's profile
     * @param {Object} data - { fullName, email, phoneNumber }
     * @returns {Promise<ProfileResponse>}
     */
    updateProfile: async (data) => {
        return apiRequest('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },


};

/**
 * Passenger API Methods (Saved Passengers)
 */
export const passengerAPI = {
    /**
     * Get all saved passengers for current user
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/passengers', { method: 'GET' });
    },

    /**
     * Add a new passenger
     * @param {Object} data - { name, age, gender }
     * @returns {Promise<Object>}
     */
    add: async (data) => {
        return apiRequest('/api/passengers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update an existing passenger
     * @param {number} id - Passenger ID
     * @param {Object} data - { name, age, gender }
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        return apiRequest(`/api/passengers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a passenger
     * @param {number} id - Passenger ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        return apiRequest(`/api/passengers/${id}`, { method: 'DELETE' });
    },
};

/**
 * Restaurant API Methods
 */
export const restaurantAPI = {
    /**
     * Get all restaurants
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/restaurants', { method: 'GET' });
    },

    /**
     * Get restaurant by ID
     * @param {number} id - Restaurant ID
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        return apiRequest(`/api/restaurants/${id}`, { method: 'GET' });
    },

    /**
     * Delete a restaurant
     * @param {number} id - Restaurant ID
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        return apiRequest(`/api/restaurants/${id}`, { method: 'DELETE' });
    },

    /**
     * Get restaurants by station ID
     * @param {number} stationId - Station ID
     * @returns {Promise<Array>}
     */
    getByStation: async (stationId) => {
        return apiRequest(`/api/restaurants/station/${stationId}`, { method: 'GET' });
    },

    /**
     * Get menu items for a restaurant
     * @param {number} restaurantId - Restaurant ID
     * @returns {Promise<Array>}
     */
    getMenu: async (restaurantId) => {
        return apiRequest(`/api/restaurants/${restaurantId}/menu`, { method: 'GET' });
    },

    /**
     * Get restaurants owned by current vendor
     * @returns {Promise<Array>}
     */
    getMyRestaurants: async () => {
        return apiRequest('/api/restaurants/vendor/profile', { method: 'GET' });
    },

    /**
     * Create a new restaurant
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        return apiRequest('/api/restaurants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },



    /**
     * Update a restaurant
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        return apiRequest(`/api/restaurants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

/**
 * Wallet API Methods
 */
export const walletAPI = {
    /**
     * Get wallet details for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>}
     */
    getWallet: async (userId) => {
        return apiRequest(`/api/wallet?userId=${userId}`, { method: 'GET' });
    },

    /**
     * Get wallet balance
     * @param {number} userId - User ID
     * @returns {Promise<number>}
     */
    getBalance: async (userId) => {
        return apiRequest(`/api/wallet/balance?userId=${userId}`, { method: 'GET' });
    },

    /**
     * Create wallet for user
     * @param {number} userId - User ID
     * @returns {Promise<Object>}
     */
    createWallet: async (userId) => {
        return apiRequest(`/api/wallet/create?userId=${userId}`, { method: 'POST' });
    },

    /**
     * Add money to wallet - initiates payment order
     * @param {Object} data - { userId, amount }
     * @returns {Promise<Object>}
     */
    addMoney: async (data) => {
        return apiRequest('/api/wallet/add-money', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Confirm money added after successful payment
     * @param {string} razorpayPaymentId - Payment ID from Razorpay
     * @param {number} userId - User ID
     * @returns {Promise<Object>}
     */
    confirmAddMoney: async (razorpayPaymentId, userId, razorpayOrderId = null) => {
        let url = `/api/wallet/confirm-add-money?razorpayPaymentId=${razorpayPaymentId}&userId=${userId}`;
        if (razorpayOrderId) {
            url += `&razorpayOrderId=${razorpayOrderId}`;
        }
        return apiRequest(url, {
            method: 'POST',
        });
    },

    /**
     * Pay from wallet
     * @param {Object} data - { userId, amount, description, orderId }
     * @returns {Promise<Object>}
     */
    payFromWallet: async (data) => {
        return apiRequest('/api/wallet/pay', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get transaction history
     * @param {number} userId - User ID
     * @returns {Promise<Array>}
     */
    getTransactions: async (userId) => {
        return apiRequest(`/api/wallet/transactions?userId=${userId}`, { method: 'GET' });
    },

    /**
     * Check if wallet exists
     * @param {number} userId - User ID
     * @returns {Promise<boolean>}
     */
    exists: async (userId) => {
        return apiRequest(`/api/wallet/exists?userId=${userId}`, { method: 'GET' });
    },
};

/**
 * Order API Methods
 */
export const orderAPI = {
    /**
     * Create a new order
     * @param {Object} data - OrderRequest
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        return apiRequest('/api/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @returns {Promise<Object>}
     */
    getById: async (orderId) => {
        return apiRequest(`/api/orders/${orderId}`, { method: 'GET' });
    },

    /**
     * Get all orders for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>}
     */
    getUserOrders: async (userId) => {
        return apiRequest(`/api/orders/user/${userId}`, { method: 'GET' });
    },

    /**
     * Get all orders (for vendors/admins)
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/orders', { method: 'GET' });
    },

    /**
     * Update order status
     * @param {number} orderId - Order ID
     * @param {string} status - New status (PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED)
     * @returns {Promise<Object>}
     */
    updateStatus: async (orderId, status, otp = null) => {
        let url = `/api/orders/${orderId}/status?status=${status}`;
        if (otp) {
            url += `&otp=${otp}`;
        }
        return apiRequest(url, {
            method: 'PUT',
        });
    },

    /**
     * Get all orders for the logged-in vendor
     * @returns {Promise<Array>}
     */
    getVendorOrders: async () => {
        return apiRequest('/api/orders/vendor/my-orders', { method: 'GET' });
    },
};

/**
 * Pantry API Methods
 */
export const pantryAPI = {
    /**
     * Get all pantry menu items
     * @returns {Promise<Array>}
     */
    getMenu: async () => {
        return apiRequest('/api/pantry/menu', { method: 'GET' });
    },

    /**
     * Get pantry menu for a specific train
     * @param {number} trainId - Train ID
     * @returns {Promise<Array>}
     */
    getMenuByTrain: async (trainId) => {
        return apiRequest(`/api/pantry/train/${trainId}/menu`, { method: 'GET' });
    },

    /**
     * Get pantries by train ID
     * @param {number} trainId - Train ID
     * @returns {Promise<Array>}
     */
    getPantriesByTrain: async (trainId) => {
        return apiRequest(`/api/pantry/train/${trainId}`, { method: 'GET' });
    },
};

/**
 * Support API Methods
 */
export const supportAPI = {
    /**
     * Create a new support ticket
     * @param {Object} data - { name, email, message }
     * @returns {Promise<Object>}
     */
    createTicket: async (data) => {
        return apiRequest('/api/support', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    /**
     * Get current user's support tickets
     * @returns {Promise<Array>}
     */
    getMyTickets: async () => {
        return apiRequest('/api/support/my-tickets', { method: 'GET' });
    },
};

/**
 * Food Item API Methods
 */
export const foodItemAPI = {
    /**
     * Get all food items
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        return apiRequest('/api/food-items', { method: 'GET' });
    },

    /**
     * Get food items by restaurant ID
     * @param {number} restaurantId
     * @returns {Promise<Array>}
     */
    getByRestaurant: async (restaurantId) => {
        return apiRequest(`/api/food-items/restaurant/${restaurantId}`, { method: 'GET' });
    },

    /**
     * Get food item by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        return apiRequest(`/api/food-items/${id}`, { method: 'GET' });
    },

    /**
     * Create a new food item
     * @param {Object} data - { name, description, price, category, imageUrl, restaurantId, vegetarian }
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        return apiRequest('/api/food-items', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a food item
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        return apiRequest(`/api/food-items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a food item
     * @param {number} id
     * @returns {Promise<void>}
     */
    delete: async (id) => {
        return apiRequest(`/api/food-items/${id}`, { method: 'DELETE' });
    },

    /**
     * Upload an image for a food item (stored in DB)
     * @param {number} id 
     * @param {File} file 
     * @returns {Promise<Object>}
     */
    uploadImage: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/food-items/${id}/image`, {
            method: 'POST',
            body: formData,
            headers: headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to upload image');
        }
        return data;
    },
};



/**
 * File API Methods
 */
export const fileAPI = {
    /**
     * Upload a file
     * @param {File} file 
     * @returns {Promise<Object>} - { fileName, fileDownloadUri, type, size }
     */
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            body: formData,
            headers: headers,
            // Note: Don't set Content-Type header manually for FormData, 
            // the browser sets it with the boundary automatically
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to upload file');
        }

        return data;
    },
};

/**
 * Review API Methods
 */
export const reviewAPI = {
    /**
     * Add a review for an order
     * @param {Object} data - { orderId, rating, comment }
     * @returns {Promise<Object>}
     */
    add: async (data) => {
        return apiRequest('/api/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get reviews for a restaurant
     * @param {number} restaurantId
     * @returns {Promise<Array>}
     */
    getRestaurantReviews: async (restaurantId) => {
        return apiRequest(`/api/reviews/restaurant/${restaurantId}`, { method: 'GET' });
    },

    /**
     * Get my reviews
     * @returns {Promise<Array>}
     */
    getMyReviews: async () => {
        return apiRequest('/api/reviews/user/my-reviews', { method: 'GET' });
    },

    /**
     * Get reviews for my restaurant (Vendor only)
     * @returns {Promise<Array>}
     */
    getVendorReviews: async () => {
        return apiRequest('/api/reviews/vendor/my-reviews', { method: 'GET' });
    },
};

/**
 * Tracking API Methods
 */
export const trackingAPI = {
    /**
     * Get live train status for an order
     * @param {number} orderId
     * @returns {Promise<Object>}
     */
    getOrderTrainStatus: async (orderId) => {
        return apiRequest(`/api/tracking/order/${orderId}/train-status`, { method: 'GET' });
    },
};

export default apiRequest;

