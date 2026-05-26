import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { MapPin, Calendar, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import TripCard from '@/components/TripCard';
import Modal from '@/components/Modal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Trip } from '@/types';

function HeroSection() {
  return (
    <div className="relative w-full gradient-hero overflow-hidden" style={{ minHeight: 320 }}>
      {/* Animated mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-blob-1"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
            top: '-100px',
            left: '10%',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-blob-2"
          style={{
            background: 'radial-gradient(circle, rgba(74,144,217,0.10) 0%, transparent 70%)',
            filter: 'blur(80px)',
            bottom: '-50px',
            right: '15%',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center" style={{ minHeight: 320 }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Trouvez votre prochain trajet
        </h1>
        <p className="text-covoit-text-secondary text-base md:text-lg max-w-lg">
          Voyagez entre villes à petit prix, en toute convivialité
        </p>
      </div>
    </div>
  );
}

function SearchBar({
  departure,
  setDeparture,
  destination,
  setDestination,
  date,
  setDate,
  onSearch,
  showFilters,
  setShowFilters,
}: {
  departure: string;
  setDeparture: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  onSearch: () => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
}) {
  return (
    <div className="relative z-20 -mt-8 px-6">
      <div className="max-w-[860px] mx-auto glass-panel rounded-2xl p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
            <input
              id="search-departure"
              type="text"
              value={departure}
              onChange={e => setDeparture(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              placeholder="Départ"
              className="input-field pl-9"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
            <input
              id="search-destination"
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              placeholder="Destination"
              className="input-field pl-9"
            />
          </div>
          <div className="flex-1 relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
            <input
              id="search-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field pl-9 text-covoit-text-secondary"
            />
          </div>
          <button
            id="search-btn"
            onClick={onSearch}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
          <button
            id="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
              showFilters
                ? 'border-covoit-orange text-covoit-orange bg-covoit-orange/10'
                : 'border-white/10 text-covoit-text-muted hover:border-white/20 hover:text-white'
            }`}
            title="Filtres avancés"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FiltersSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border border-white/10 rounded-xl p-3">
      <CollapsibleTrigger className="group w-full flex items-center justify-between text-sm font-medium text-white/90">
        <span>{title}</span>
        <ChevronDown
          size={16}
          className="text-covoit-text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FiltersSidebar({
  rangeDays,
  setRangeDays,
  maxPrice,
  setMaxPrice,
  minSeats,
  setMinSeats,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
  onApply,
  className,
}: {
  rangeDays: string;
  setRangeDays: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  minSeats: string;
  setMinSeats: (v: string) => void;
  sortBy: 'date' | 'price' | 'driverRating';
  setSortBy: (v: 'date' | 'price' | 'driverRating') => void;
  sortOrder: 'ASC' | 'DESC';
  setSortOrder: (v: 'ASC' | 'DESC') => void;
  onReset: () => void;
  onApply?: () => void;
  className?: string;
}) {
  return (
    <aside className={`glass-panel rounded-2xl p-4 space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-covoit-text-secondary">Filtres</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-covoit-text-muted hover:text-covoit-orange transition-colors"
        >
          <X size={12} />
          Réinitialiser
        </button>
      </div>

      <FiltersSection title="Dates" defaultOpen>
        <label htmlFor="filter-range-days" className="block text-xs text-covoit-text-muted mb-1.5">
          Plage de dates (+/- jours)
        </label>
        <input
          id="filter-range-days"
          type="number"
          min="1"
          value={rangeDays}
          onChange={e => setRangeDays(e.target.value)}
          placeholder="Ex: 3"
          className="input-field w-full"
        />
      </FiltersSection>

      <FiltersSection title="Budget" defaultOpen>
        <label htmlFor="filter-max-price" className="block text-xs text-covoit-text-muted mb-1.5">
          Prix max (TND)
        </label>
        <input
          id="filter-max-price"
          type="number"
          min="0"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          placeholder="Ex: 50"
          className="input-field w-full"
        />
      </FiltersSection>

      <FiltersSection title="Places" defaultOpen>
        <label htmlFor="filter-min-seats" className="block text-xs text-covoit-text-muted mb-1.5">
          Places min. disponibles
        </label>
        <input
          id="filter-min-seats"
          type="number"
          min="1"
          max="8"
          value={minSeats}
          onChange={e => setMinSeats(e.target.value)}
          placeholder="Ex: 2"
          className="input-field w-full"
        />
      </FiltersSection>

      <FiltersSection title="Tri" defaultOpen>
        <label htmlFor="filter-sort-by" className="block text-xs text-covoit-text-muted mb-1.5">
          Trier par
        </label>
        <select
          id="filter-sort-by"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'price' | 'driverRating')}
          className="input-field w-full"
        >
          <option value="date">Date</option>
          <option value="price">Prix</option>
          <option value="driverRating">Avis conducteur</option>
        </select>
        <label htmlFor="filter-sort-order" className="block text-xs text-covoit-text-muted mt-3 mb-1.5">
          Ordre
        </label>
        <select
          id="filter-sort-order"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'ASC' | 'DESC')}
          className="input-field w-full"
        >
          <option value="ASC">Ascendant</option>
          <option value="DESC">Descendant</option>
        </select>
      </FiltersSection>

      {onApply && (
        <button onClick={onApply} className="btn-primary w-full py-2">
          Appliquer les filtres
        </button>
      )}
    </aside>
  );
}

export default function Home() {
  const { searchTrips, tripsLoading, createBooking } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(today);
  const [rangeDays, setRangeDays] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSeats, setMinSeats] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'driverRating'>('date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Trip[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    const { trips: found, hasNextPage: more, endCursor: cursor, totalCount: count } = await searchTrips(
      departure,
      destination,
      date,
      rangeDays ? Number(rangeDays) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      minSeats ? Number(minSeats) : undefined,
      sortBy,
      sortOrder,
    );
    setResults(Array.isArray(found) ? found : []);
    setHasNextPage(more);
    setEndCursor(cursor);
    setTotalCount(count);
    setHasSearched(true);
    setIsSearching(false);
  }, [departure, destination, date, rangeDays, maxPrice, minSeats, sortBy, sortOrder, searchTrips]);

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;
    setIsLoadingMore(true);
    const { trips: more, hasNextPage: nextPage, endCursor: nextCursor, totalCount: count } = await searchTrips(
      departure,
      destination,
      date,
      rangeDays ? Number(rangeDays) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      minSeats ? Number(minSeats) : undefined,
      sortBy,
      sortOrder,
      undefined,
      endCursor,
    );
    setResults(prev => [...prev, ...(Array.isArray(more) ? more : [])]);
    setHasNextPage(nextPage);
    setEndCursor(nextCursor);
    setTotalCount(count);
    setIsLoadingMore(false);
  }, [departure, destination, date, rangeDays, maxPrice, minSeats, sortBy, sortOrder, endCursor, hasNextPage, searchTrips]);

  const handleResetFilters = useCallback(() => {
    setRangeDays('');
    setMaxPrice('');
    setMinSeats('');
    setSortBy('date');
    setSortOrder('ASC');
  }, []);

  const handleBook = useCallback(async () => {
    if (!bookingTrip) return;
    setIsBooking(true);
    await createBooking(bookingTrip.id);
    setIsBooking(false);
    setBookingTrip(null);
  }, [bookingTrip, createBooking]);

  // Auto-search on mount to show all trips
  useEffect(() => {
    (async () => {
      setIsSearching(true);
      const { trips: allTrips, hasNextPage: more, endCursor: cursor, totalCount: count } = await searchTrips('', '', '', undefined, undefined, undefined, sortBy, sortOrder);
      setResults(Array.isArray(allTrips) ? allTrips : []);
      setHasNextPage(more);
      setEndCursor(cursor);
      setTotalCount(count);
      setHasSearched(true);
      setIsSearching(false);
    })();
  }, []); // run once on mount only

  const loading = isSearching || tripsLoading;

  return (
    <div className="animate-fade-in">
      <HeroSection />
      <SearchBar
        departure={departure}
        setDeparture={setDeparture}
        destination={destination}
        setDestination={setDestination}
        date={date}
        setDate={setDate}
        onSearch={handleSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {showFilters && (
            <div className="lg:hidden">
              <FiltersSidebar
                rangeDays={rangeDays}
                setRangeDays={setRangeDays}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minSeats={minSeats}
                setMinSeats={setMinSeats}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                onReset={handleResetFilters}
                onApply={handleSearch}
              />
            </div>
          )}

          <div className="hidden lg:block lg:w-[240px] lg:-ml-3">
            <FiltersSidebar
              rangeDays={rangeDays}
              setRangeDays={setRangeDays}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minSeats={minSeats}
              setMinSeats={setMinSeats}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onReset={handleResetFilters}
              onApply={handleSearch}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {hasSearched
                  ? `Trajets disponibles${totalCount > 0 ? ` (${totalCount})` : ''}`
                  : 'Trajets disponibles'}
              </h2>
              {loading && (
                <span className="text-sm text-covoit-text-muted animate-pulse">Recherche en cours...</span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-surface rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="h-5 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-px bg-white/[0.04]" />
                    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
                    <div className="h-4 bg-white/[0.06] rounded w-full" />
                    <div className="h-px bg-white/[0.04]" />
                    <div className="h-10 bg-white/[0.06] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-covoit-text-secondary text-lg mb-2">Aucun trajet trouvé</p>
                <p className="text-covoit-text-muted text-sm">Essayez d'autres critères de recherche</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onBook={(tripId) => {
                        const t = results.find(tr => tr.id === tripId);
                        if (t) setBookingTrip(t);
                      }}
                    />
                  ))}
                </div>
                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <button
                      id="load-more-btn"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="btn-ghost px-8 py-3 border border-white/10 rounded-xl hover:border-covoit-orange/50 hover:text-covoit-orange transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-covoit-orange/30 border-t-covoit-orange rounded-full animate-spin" />
                          Chargement...
                        </span>
                      ) : (
                        'Voir plus de trajets'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        open={!!bookingTrip}
        onClose={() => setBookingTrip(null)}
        title="Confirmer votre réservation"
      >
        {bookingTrip && (
          <div className="space-y-4">
            <div className="bg-covoit-bg-tertiary rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-covoit-text-secondary text-sm">Trajet</span>
                <span className="text-white font-medium">
                  {bookingTrip.departure} → {bookingTrip.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-covoit-text-secondary text-sm">Date</span>
                <span className="text-white font-medium">{bookingTrip.date} à {bookingTrip.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-covoit-text-secondary text-sm">Conducteur</span>
                <span className="text-white font-medium">{bookingTrip.driver.name}</span>
              </div>
              <div className="h-px bg-white/[0.06] my-2" />
              <div className="flex items-center justify-between">
                <span className="text-covoit-text-secondary text-sm">Prix total</span>
                <span className="text-covoit-orange font-bold text-lg">{bookingTrip.price} TND</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingTrip(null)}
                className="btn-ghost flex-1 py-3"
              >
                Annuler
              </button>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {isBooking ? 'Réservation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
