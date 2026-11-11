import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Phone,
  Mail,
  Trophy,
  Search,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { EventCard, EventItem } from '../components/EventCard.tsx';

interface HomePageProps {
  onSelectEvent: (slug: string) => void;
  onExploreAll: (filters?: { category?: string; query?: string }) => void;
  onQuickBook: (event: EventItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectEvent,
  onExploreAll,
  onQuickBook,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const evRes = await fetch('/api/events?limit=12');
        const evData = await evRes.json();
        setEvents(evData.events || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredEvents = events.filter((e) => e.isFeatured);
  const upcomingEvents = events.slice(0, 6);

  return (
    <>
      {/* 1. HERO SECTION (FULL WIDTH WITH BACKGROUND IMAGE) */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&h=1080&fit=crop&q=80"
            alt="Concert Event"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - darker on left for text readability, lighter on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/60 to-stone-900/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-sm font-bold uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-[#DEC9A6]" />
              <span>Next-Gen Event & Concert Ticketing</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05]">
              Discover Events. <br />
              <span className="bg-gradient-to-r from-[#DEC9A6] via-[#E8D1AC] to-[#F5EFEB] bg-clip-text text-transparent">
                Book Your Experience.
              </span>
            </h1>

            <p className="text-white/90 text-lg sm:text-xl lg:text-2xl max-w-xl leading-relaxed font-medium">
              Direct-from-organizer verified tickets. Atomic inventory protection against overselling, instant digital QR passes, and zero scalper markups.
            </p>

            {/* Explore Events Button */}
            <button
              onClick={() => onExploreAll()}
              className="inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl bg-[#965A28] hover:bg-[#824B1E] text-white font-bold text-lg md:text-xl shadow-xl shadow-[#965A28]/40 transition-all hover:scale-105"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Quick Metrics */}
            <div className="pt-6 flex flex-wrap items-center gap-8 text-base md:text-lg text-white/90 font-semibold">
              <span className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                100% Guaranteed Official Tickets
              </span>
              <span className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#DEC9A6]" />
                Cryptographic QR Gate Passes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the content with container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20 pt-12">

      {/* STATS STRIP */}
      <section className="-mt-24 relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { v: '100%', l: 'Verified Tickets' },
          { v: 'Instant', l: 'QR Delivery' },
          { v: '0', l: 'Scalper Markups' },
          { v: '24/7', l: 'Online Booking' },
        ].map((x) => (
          <div key={x.l} className="p-6 rounded-2xl bg-white border border-[#EADBCA] shadow-lg text-center">
            <div className="text-2xl sm:text-3xl font-black text-[#965A28]">{x.v}</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">{x.l}</div>
          </div>
        ))}
      </section>

      {/* 2. FEATURED HEADLINER SHOWS */}
      {featuredEvents.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#8A5120]" />
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Featured Headliners & Major Festivals
              </h2>
            </div>
            <span className="text-base font-mono text-[#5C330B] bg-[#EBD8C0] px-4 py-2 rounded-full border border-[#DECAAC] font-bold">
              Selling Fast
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onSelect={onSelectEvent}
                onQuickBook={onQuickBook}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. UPCOMING SHOWS & LIVE GIGS */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Upcoming Shows & Events
            </h2>
            <p className="text-base text-stone-600 mt-2 font-medium">
              Concerts, intimate acoustic sets, and technology expos happening soon.
            </p>
          </div>
          <button
            onClick={() => onExploreAll()}
            className="text-base font-bold text-[#8A5120] hover:text-[#6E3D12] flex items-center gap-2 transition-colors"
          >
            <span>View Full Schedule</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-white border border-[#EADBCA] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onSelect={onSelectEvent}
                onQuickBook={onQuickBook}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. PLATFORM VALUE BANNER (WHEAT THEMED) */}
      <section className="rounded-3xl bg-[#F4EDE2] border border-[#DFCDB7] p-10 lg:p-16 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center mx-auto md:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-xl">No Overselling, Ever</h3>
            <p className="text-base text-stone-600 leading-relaxed font-medium">
              Every ticket is reserved safely in real time, so you never arrive at a venue to find your seat double-booked.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center mx-auto md:mx-0">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-xl">Instant Digital Pass & QR</h3>
            <p className="text-base text-stone-600 leading-relaxed font-medium">
              Tickets are generated instantaneously on payment. View, print, or save to your mobile device with offline-ready gate barcodes.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center mx-auto md:mx-0">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-xl">Fast Gate Check-In</h3>
            <p className="text-base text-stone-600 leading-relaxed font-medium">
              Event staff scan your QR pass with a phone camera and let you in within seconds.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">How It Works</h2>
          <p className="text-base text-stone-600 mt-2 font-medium">Three simple steps from browsing to the gate</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, t: '1. Find an event', d: 'Browse concerts, festivals and shows happening near you.' },
            { icon: CreditCard, t: '2. Book & pay', d: 'Pick your tickets and pay securely, including by M-Pesa.' },
            { icon: QrCode, t: '3. Show your QR', d: 'Get your digital pass instantly and scan it at the gate.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-8 rounded-2xl bg-white border border-[#EADBCA] hover:border-[#C2824A] hover:shadow-md transition-all text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center mx-auto">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-lg">{t}</h3>
              <p className="text-stone-600 font-medium">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SPONSORS SECTION */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Our Sponsors
          </h2>
          <p className="text-base text-stone-600 mt-2 font-medium">
            Proudly supported by leading brands
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Safari Beer', 'Equity Bank', 'Safaricom', 'Coca-Cola'].map((sponsor, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#EADBCA] hover:border-[#C2824A] hover:shadow-md transition-all text-center"
            >
              <Trophy className="w-8 h-8 text-[#9B5E28] mx-auto mb-3" />
              <span className="font-bold text-stone-900">{sponsor}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CONTACT INFORMATION */}
      <section className="rounded-3xl bg-[#F4EDE2] border border-[#DFCDB7] p-10 lg:p-16 shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-base text-stone-600 mt-2 font-medium">
            Get in touch for support or inquiries
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-[#EADBCA]">
            <div className="w-12 h-12 rounded-xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">Contact Us</h3>
              <a href="tel:0710507016" className="text-stone-600 font-medium hover:text-[#8A5120]">0710507016</a>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-[#EADBCA]">
            <div className="w-12 h-12 rounded-xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">Email</h3>
              <a href="mailto:brianzach1@gmail.com" className="text-stone-600 font-medium hover:text-[#8A5120]">brianzach1@gmail.com</a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};
