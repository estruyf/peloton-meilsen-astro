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
      setError('Failed to load rider statistics. Please try again later.');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-6">
      <div className="bg-light rounded-lg shadow p-6">
        <h2 className="text-xl text-primary font-semibold mb-4">Check statistieken</h2>
        <div className="mb-4">
          <label htmlFor="rider-select" className="block text-sm font-medium text-primary mb-2">
            Selecteer je naam:
          </label>
          <select
            id="rider-select"
            value={selectedRider}
            onChange={handleRiderSelect}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-primary border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">-- Selecteer een rijder --</option>
            {members.map(rider => (
              <option key={rider.id} value={rider.name}>
                {rider.name}
              </option>
            ))}
          </select>
        </div>

        {selectedRiderStats && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-primary">{selectedRiderStats.name} - Statistieken</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-light overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-primary truncate">
                    Totaal Aantal Ritten
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {selectedRiderStats.name === 'Yves Van Grimberge' ? '∞' : selectedRiderStats.rideCount}
                  </dd>
                </div>
              </div>
              <div className="bg-light overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-primary truncate">
                    Rang
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {calculateRank(selectedRiderStats)} / {riderStats.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-light rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Leaderboard</h2>
        <p className="text-primary mb-4">
          Totaal aantal rijders: <strong>{riderStats.length}</strong>
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Rang
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Rijder
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Ritten
                </th>
              </tr>
            </thead>
            <tbody className="bg-light divide-y divide-gray-200">
              {riderStats.map((rider, index) => (
                <tr key={index} className={selectedRider === rider.name ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {calculateRank(rider)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {rider.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    {rider.name === 'Yves Van Grimberge' ? '∞' : rider.rideCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}