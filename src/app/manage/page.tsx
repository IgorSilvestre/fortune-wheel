'use client';

import { useEffect, useState } from 'react';
import { addWheelOption, deleteWheelOption, getWheelOptions } from '@/app/actions';

export default function ManageOptions() {
  const [options, setOptions] = useState<{ id: number; text: string }[]>([]);
  const [newOption, setNewOption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOptions = async () => {
    const data = await getWheelOptions();
    setOptions(data);
    setLoading(false);
  };

  useEffect(() => {
    getWheelOptions().then((data) => {
      setOptions(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newOption.length < 3 || newOption.length > 20) {
      setError('A opção deve ter entre 3 e 20 caracteres.');
      return;
    }

    const res = await addWheelOption(newOption.trim());
    if (res.error) {
      setError(res.error);
    } else {
      setNewOption('');
      await loadOptions();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteWheelOption(id);
    if (!res.error) {
      await loadOptions();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Opções da Roda</h1>
        <p className="text-gray-600 dark:text-gray-400">Adicione ou remova itens da roda da fortuna.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Adicionar Nova Opção</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="ex. Café Grátis"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              minLength={3}
              maxLength={20}
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            Adicionar
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-semibold">Opções Atuais</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Carregando opções...</p>
          ) : options.length === 0 ? (
            <p className="p-6 text-center text-gray-500">Nenhuma opção adicionada ainda.</p>
          ) : (
            options.map((option) => (
              <div key={option.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="font-medium">{option.text}</span>
                <button
                  onClick={() => handleDelete(option.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-md transition-colors text-sm cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
