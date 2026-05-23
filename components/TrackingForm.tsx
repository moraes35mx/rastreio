'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export function TrackingForm() {
  const [code, setCode] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) {
      router.push(`/rastreio/${trimmed}`);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código de rastreio"
          className="w-full px-5 py-4 pr-36 bg-zinc-900/80 border border-zinc-700/50 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 backdrop-blur-sm text-lg transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Rastrear</span>
        </button>
      </div>
    </motion.form>
  );
}
