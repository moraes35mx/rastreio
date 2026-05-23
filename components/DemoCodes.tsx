'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { Status } from '@/lib/status';

interface DemoShipment {
  codigo: string;
  status: Status;
  rota: string;
}

const DEMO_SHIPMENTS: DemoShipment[] = [
  { codigo: 'TR482917365BR', status: 'entregue', rota: 'SP → RJ' },
  { codigo: 'TR739150284BR', status: 'em_rota_entrega', rota: 'PR → SC' },
  { codigo: 'TR615823947BR', status: 'em_transito', rota: 'MG → BA' },
  { codigo: 'TR204867531BR', status: 'tentativa_falha', rota: 'PE → CE' },
  { codigo: 'TR378491026BR', status: 'postado', rota: 'RS → DF' },
];

export function DemoCodes() {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-center text-sm text-zinc-500 uppercase tracking-wider mb-4">
        Códigos de demonstração
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEMO_SHIPMENTS.map((demo, idx) => (
          <motion.div
            key={demo.codigo}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + idx * 0.08 }}
          >
            <Link
              href={`/rastreio/${demo.codigo}`}
              className="block p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl hover:border-amber-500/30 hover:bg-zinc-800/60 transition-all group backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono text-zinc-300 group-hover:text-amber-400 transition-colors">
                  {demo.codigo}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{demo.rota}</span>
                <StatusBadge status={demo.status} size="sm" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
