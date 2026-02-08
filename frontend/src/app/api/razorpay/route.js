import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { amount } = await request.json();

    // Initialize Razorpay with REAL keys from backend config
    const razorpay = new Razorpay({
        key_id: 'rzp_test_RpC0BqmwMSjqTT',
        key_secret: '0sThxGOwhu3I5wCZPFJY71CH',
    });

    const options = {
        amount: Math.round(amount * 100), // amount in paisa (ensure integer)
        currency: 'INR',
        receipt: 'receipt_' + Date.now().toString().substring(7),
    };

    try {
        // Create REAL order with Razorpay
        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
