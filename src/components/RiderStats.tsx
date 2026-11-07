import React, { useEffect, useState } from 'react';
import { getMembers } from '../lib/api';

interface RiderStat {
  id: string;
  name: string;
  rideCount: number;
}

export default function RiderStats() {
  const [members, setMembers] = useState<RiderStat[]>([]);
  const [riderStats, setRiderStats] = useState<RiderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRider, setSelectedRider] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  // Function to extract first name from a full name
  const getFirstName = (fullName: string): string => {
    // Default case: first word is the first name
    return fullName.split(' ')[0].toLowerCase();
  };

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      let members = await getMembers();

      // Sort members by first name
      const sortedByName = Object.assign([], members).sort((a: RiderStat, b: RiderStat) => {
        const firstNameA = getFirstName(a.name);
        const firstNameB = getFirstName(b.name);
        return firstNameA.localeCompare(firstNameB);
      });

      setMembers(sortedByName);

      // Sort by ride count for the leaderboard, but put Yves Van Grimberge first
      const sortedByRideCount = Object.assign([], sortedByName).sort((a: RiderStat, b: RiderStat) => {
        // Always put Yves Van Grimberge at the top
        if (a.name === 'Yves Van Grimberge') return -1;
        if (b.name === 'Yves Van Grimberge') return 1;
        // Otherwise sort by ride count as before
        return b.rideCount - a.rideCount;
      });

      setRiderStats(sortedByRideCount);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('De rangschikking kon niet geladen worden. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  function handleRiderSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRider(e.target.value);
  }

  // Precompute ranks for all riders based on ride count
  const ranks = React.useMemo(() => {
    const sortedRiders = [...riderStats].sort((a, b) => b.rideCount - a.rideCount);
    let rank = 2; // Start from 2 since Yves Van Grimberge will be #1
    const computedRanks: { [nrOfRides: string]: number } = {};

    for (const rider of sortedRiders) {
      // Skip Yves Van Grimberge in this calculation as he's always #1
      if (rider.name === 'Yves Van Grimberge') continue;

      if (!computedRanks[rider.rideCount]) {
        computedRanks[rider.rideCount] = rank;
        rank++;
      }
    }

    return computedRanks;
  }, [riderStats]);

  // Function to get a rider's rank from precomputed ranks
  const calculateRank = React.useCallback((rider: RiderStat): number => {
    // Always return 1 for Yves Van Grimberge
    if (rider.name === 'Yves Van Grimberge') return 1;
    return ranks[rider.rideCount];
  }, [ranks]);

  const selectedRiderStats = selectedRider
    ? riderStats.find(rider => rider.name === selectedRider)
    : null;

  const displayRides = (rider: RiderStat) =>
    rider.name === 'Yves Van Grimberge' ? '∞' : rider.rideCount;

  if (loading) {
    return (
      <div className="grid animate-pulse gap-6 lg:grid-cols-12" aria-busy="true" aria-label="Rangschikking wordt geladen">
        <div className="h-72 rounded-3xl bg-ink/10 lg:col-span-4" />
        <div className="space-y-2 lg:col-span-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-ink/10" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        <div className="rounded-3xl bg-ink p-6 text-paper md:p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-signal">Jouw statistieken</p>
          <label htmlFor="rider-select" className="mt-5 block text-sm font-medium text-paper/80">
            Selecteer je naam
          </label>
          <select
            id="rider-select"
            value={selectedRider}
            onChange={handleRiderSelect}
            className="field mt-2"
          >
            <option value="">— Selecteer een rijder —</option>
            {members.map(rider => (
              <option key={rider.id} value={rider.name}>
                {rider.name}
              </option>
            ))}
          </select>

          {selectedRiderStats ? (
            <dl className="mt-6 grid grid-cols-2 gap-3" aria-live="polite">
              <div className="rounded-2xl bg-paper/10 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/60">Ritten</dt>
                <dd className="font-display mt-2 text-5xl text-signal">{displayRides(selectedRiderStats)}</dd>
              </div>
              <div className="rounded-2xl bg-paper/10 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/60">Rang</dt>
                <dd className="mt-2">
                  <span className="font-display text-5xl">{calculateRank(selectedRiderStats)}</span>
                  <span className="text-sm text-paper/60"> / {riderStats.length}</span>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-6 text-sm text-paper/60">
              Kies je naam om je aantal ritten en je plaats in het peloton te zien.
            </p>
          )}

          <p className="mt-6 border-t border-paper/10 pt-5 text-sm text-paper/60">
            Totaal aantal rijders: <strong className="text-paper">{riderStats.length}</strong>
          </p>
        </div>
      </div>

      <div className="lg:col-span-8">
        <table className="w-full border-separate border-spacing-y-2">
          <caption className="sr-only">Leaderboard op basis van het aantal gereden ritten</caption>
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
              <th scope="col" className="w-20 px-4 pb-2 md:w-24 md:px-6">Rang</th>
              <th scope="col" className="px-4 pb-2">Rijder</th>
              <th scope="col" className="px-4 pb-2 text-right md:px-6">Ritten</th>
            </tr>
          </thead>
          <tbody>
            {riderStats.map((rider) => {
              const rank = calculateRank(rider);
              const selected = selectedRider === rider.name;
              const podium = rank <= 3;
              const rowBg = selected
                ? 'bg-signal text-ink'
                : podium
                  ? 'bg-ink text-paper'
                  : 'bg-paper-50 text-ink';
              return (
                <tr key={rider.id ?? rider.name} className={rowBg} aria-current={selected ? 'true' : undefined}>
                  <td className="rounded-l-2xl px-4 py-3 md:px-6">
                    <span className={`font-display text-2xl ${podium && !selected ? 'text-signal' : ''}`}>{rank}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{rider.name}</td>
                  <td className="rounded-r-2xl px-4 py-3 text-right font-semibold tabular-nums md:px-6">
                    {displayRides(rider)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
