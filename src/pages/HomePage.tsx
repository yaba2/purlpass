import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Music,
  Laptop,
  Drama,
  Trophy,
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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categoryIcons: Record<string, any> = {
    'music-concerts': Music,
    festivals: Sparkles,
    'tech-conferences': Laptop,
    'arts-theatre': Drama,
    nightlife: Flame,
    'sports-gaming': Trophy,
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [evRes, catRes] = await Promise.all([
          fetch('/api/events?limit=12'),
          fetch('/api/categories'),
        ]);
        const evData = await evRes.json();
        const catData = await catRes.json();
        setEvents(evData.events || []);
        setCategories(catData || []);
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreAll({ query: searchQuery });
  };

  return (
    <>
      {/* 1. HERO SECTION (FULL WIDTH WITH BACKGROUND IMAGE) */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1920&h=1080&fit=crop"
            alt="Concert Event"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - darker on left for text readability, lighter on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/60 to-stone-900/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl space-y-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">

      {/* 2. POPULAR CATEGORIES */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Explore By Category
            </h2>
            <p className="text-base text-stone-600 mt-2 font-medium">
              Find your next favorite show across genres and spectacles.
            </p>
          </div>
          <button
            onClick={() => onExploreAll()}
            className="text-base font-bold text-[#8A5120] hover:text-[#6E3D12] flex items-center gap-2 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => onExploreAll({ category: cat.slug })}
                className="group p-5 rounded-2xl bg-white border border-[#EADBCA] hover:border-[#C2824A] hover:bg-[#FAF4EB] text-left transition-all duration-200 flex flex-col justify-between h-36 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] border border-[#E5DAC8] group-hover:border-[#C2824A] group-hover:bg-[#EEDEC8] flex items-center justify-center text-[#8A5120] transition-colors">
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900 group-hover:text-[#8A5120] transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <span className="text-sm text-stone-500 font-mono block mt-1 font-medium">
                    Browse →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED HEADLINER SHOWS */}
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

      {/* 4. UPCOMING SHOWS & LIVE GIGS */}
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

      {/* 5. PLATFORM VALUE BANNER (WHEAT THEMED) */}
      <section className="rounded-3xl bg-[#F4EDE2] border border-[#DFCDB7] p-10 lg:p-16 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E8D9C5] text-[#7A4515] flex items-center justify-center mx-auto md:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-xl">Atomic Zero-Oversell Engine</h3>
            <p className="text-base text-stone-600 leading-relaxed font-medium">
              Every ticket reservation uses ACID database transactions in PostgreSQL. Never arrive to a venue to find a seat duplicated.
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
            <h3 className="font-extrabold text-stone-900 text-xl">Organizer & Gate Scanner Hub</h3>
            <p className="text-base text-stone-600 leading-relaxed font-medium">
              Authorized check-in staff validate tickets in milliseconds using device cameras, recording attendance timestamps directly to Cloud SQL.
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};
