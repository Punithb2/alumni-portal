import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import useAuth from '../../hooks/useAuth';
import { ArrowLeft, Calendar, MapPin, Users, Ticket, CheckCircle2 } from 'lucide-react';

export default function EventDetail() {
    const { id } = useParams();
    const { getEventById, registerUser } = useEvents();
    const { user } = useAuth();
    const event = getEventById(id);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!event) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Event Not Found</h2>
                <Link to="/events" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to Events
                </Link>
            </div>
        );
    }

    // Derived state
    const isFree = event.price === 0 || !event.price;
    const isSoldOut = event.capacity && event.attendees >= event.capacity;
    const currentUser = user || { id: 'u1', name: 'Demo Alumni' };
    const hasRegistered = event.registeredUsers?.some(u => u.id === currentUser.id);

    let dateObj = new Date();
    try { dateObj = new Date(event.date); } catch (e) { }
    const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(dateObj);
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(dateObj);

    const [showPaymentAlert, setShowPaymentAlert] = useState(false);

    const handleRegister = () => {
        if (!isFree) {
            setShowPaymentAlert(true);
            setTimeout(() => setShowPaymentAlert(false), 3000);
            return;
        }
        registerUser(event.id, currentUser);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto py-6 md:py-8 animate-in fade-in duration-500">
            <Link to="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-semibold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <ArrowLeft size={16} /> Back to Events
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-3xl overflow-hidden bg-slate-100 relative h-72 sm:h-96 shadow-md border border-slate-200">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

                        <div className="absolute top-4 left-4 flex gap-2">
                            {event.category && (
                                <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm uppercase tracking-wider">
                                    {event.category}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">{event.title}</h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{dateStr}</p>
                                    <p className="text-sm text-slate-500 font-medium">{timeStr}</p>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-slate-200 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{event.location}</p>
                                    <p className="text-sm text-slate-500 font-medium">{event.type || 'Location'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-lg text-slate-600">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">About this event</h3>
                            <p>{event.description}</p>
                            <p>Join us for an incredible gathering designed to connect, inspire, and foster lifelong relationships among our vibrant alumni community. This event features expert panels, dedicated networking sessions, and opportunities to meaningfully engage with your peers.</p>
                        </div>
                    </div>
                </div>

                {/* Tiketing Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm sticky top-24">
                        <div className="text-center mb-6 pb-6 border-b border-slate-100">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Registration</p>
                            <div className="text-4xl font-black text-slate-900 flex items-center justify-center gap-2">
                                {isFree ? 'Free' : `₹${event.price}`}
                            </div>
                            {!isFree && <p className="text-sm text-slate-400 mt-1">per person</p>}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium flex items-center gap-2"><Users size={16} /> Capacity</span>
                                <span className="font-bold text-slate-900">{event.capacity || 'Unlimited'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium flex items-center gap-2"><Ticket size={16} /> Registered</span>
                                <span className="font-bold text-slate-900">{event.attendees || 0}</span>
                            </div>

                            {event.capacity && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className={event.capacity - (event.attendees || 0) < 10 ? 'text-rose-500' : 'text-slate-500'}>
                                            {event.capacity - (event.attendees || 0)} spots left
                                        </span>
                                        <span className="text-slate-400">{Math.round(((event.attendees || 0) / event.capacity) * 100)}% Full</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${event.capacity - (event.attendees || 0) < 10 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, ((event.attendees || 0) / event.capacity) * 100)}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {hasRegistered ? (
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-emerald-100 text-center">
                                <CheckCircle2 size={32} className="text-emerald-500 mb-1" />
                                <p className="font-bold text-lg">You're Registered!</p>
                                <p className="text-xs">Check your email for tickets.</p>
                            </div>
                        ) : isSuccess ? (
                            <div className="bg-indigo-50 text-indigo-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-indigo-100 text-center animate-in zoom-in-95 duration-300">
                                <CheckCircle2 size={32} className="text-indigo-500 mb-1" />
                                <p className="font-bold text-lg">Success!</p>
                                <p className="text-xs">Securely processing...</p>
                            </div>
                        ) : showPaymentAlert ? (
                            <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-amber-100 text-center animate-in zoom-in-95 duration-300">
                                <p className="font-bold text-sm">Payment Integration Pending</p>
                                <p className="text-xs">Please wait till we integrate payments like Razorpay.</p>
                            </div>
                        ) : isSoldOut ? (
                            <button className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed border border-slate-200">
                                Sold Out
                            </button>
                        ) : (
                            <button
                                onClick={handleRegister}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md flex justify-center items-center gap-2"
                            >
                                <Ticket size={20} /> Checkout & Register
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
