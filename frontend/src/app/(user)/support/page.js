"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const faqs = [
    {
        question: "How do I track my food order?",
        answer: "You can track your order in real-time by going to the 'My Orders' section and clicking on the 'Track Order' button for your active order."
    },
    {
        question: "What if my train is delayed?",
        answer: "Our delivery partners track train status in real-time. If your train is delayed, we adjust the delivery timing accordingly. In case of significant delays, please contact support."
    },
    {
        question: "Can I cancel my order?",
        answer: "Yes, you can cancel your order up to 1 hour before the scheduled delivery time from the 'My Orders' page. A full refund will be initiated."
    },
    {
        question: "How do I get a refund?",
        answer: "Refunds for cancelled orders or failed deliveries are processed within 5-7 business days to your original payment method."
    }
];

export default function SupportPage() {
    const [openIndex, setOpenIndex] = useState(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Pre-fill user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || user.username || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const loadTickets = async () => {
        try {
            const { supportAPI } = await import('@/services/api');
            const data = await supportAPI.getMyTickets();
            setTickets(data || []);
        } catch (error) {
            console.error("Failed to load support history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { supportAPI } = await import('@/services/api');
            await supportAPI.createTicket(formData);
            alert("Thank you for contacting us! We will get back to you shortly.");
            setFormData({ name: '', email: '', message: '' });
            loadTickets(); // Refresh history
        } catch (error) {
            console.error("Support submission failed:", error);
            alert("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
                    <p className="text-xl text-gray-600">Find answers to common questions or get in touch with our team.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* FAQ Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <HelpCircle className="w-6 h-6 mr-2 text-orange-600" /> Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="font-semibold text-gray-800">{faq.question}</span>
                                        {openIndex === index ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </button>
                                    {openIndex === index && (
                                        <div className="bg-gray-50 px-6 pb-4">
                                            <p className="text-gray-600 pt-2">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                            <h3 className="font-bold text-blue-900 mb-2">Need immediate assistance?</h3>
                            <div className="flex flex-col space-y-2">
                                <a href="tel:+911800123456" className="flex items-center text-blue-700 hover:underline">
                                    <Phone className="w-4 h-4 mr-2" /> 1800-123-456 (24/7 Helpline)
                                </a>
                                <a href="mailto:support@railmeal.com" className="flex items-center text-blue-700 hover:underline">
                                    <Mail className="w-4 h-4 mr-2" /> support@railmeal.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <MessageSquare className="w-6 h-6 mr-2 text-orange-600" /> Send us a message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                    placeholder="Describe your issue or query..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Support History Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Clock className="w-6 h-6 mr-2 text-orange-600" /> Your Previous Messages
                    </h2>

                    {loadingHistory ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                            <p className="text-gray-500">You haven't sent any messages yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="ml-3 text-xs text-gray-400">
                                                {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed font-medium mb-1">Q: {ticket.message}</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mt-4">
                                        <p className="text-sm text-gray-600 italic">
                                            {ticket.status === 'OPEN' ? 'Our team is reviewing your query. Expect a response soon.' : 'Resolution: [Placeholder for response content]'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
