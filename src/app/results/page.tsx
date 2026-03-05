'use client';

import { useEffect, useState } from 'react';
import { getResults } from '@/app/actions';

export default function Results() {
  const [results, setResults] = useState<{
    id: number;
    user_id: string;
    name: string;
    option_won: string;
    created_at: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults().then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Spin Results</h1>
        <p className="text-gray-600 dark:text-gray-400">See who spun the wheel and what they won.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">ID (Fingerprint)</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Prize Won</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Loading results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No results found. Spin the wheel to see records here!
                  </td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {result.user_id.slice(0, 10)}...
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {result.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">
                      {result.option_won}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(result.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
