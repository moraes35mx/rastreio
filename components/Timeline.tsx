'use client';

import { motion } from 'framer-motion';
import { STATUS_META, type Status } from '@/lib/status';
import { formatDateTime } from '@/lib/format';
import type { TrackingEvent } from '@/lib/types';

interface TimelineProps {
  events: TrackingEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.ocorrido_em).getTime() - new Date(a.ocorrido_em).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />

      <div className="space-y-0">
        {sorted.map((event, idx) => {
          const meta = STATUS_META[event.status as Status];
          const Icon = meta.icon;
          const isFirst = idx === 0;

          return (
            <motion.div
              key={event.id}
              className="relative flex gap-4 pb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              {/* Icon circle */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isFirst
                      ? `${meta.color} ${meta.borderColor} ${meta.textColor}`
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                  }`}
                  animate={
                    isFirst
                      ? { boxShadow: ['0 0 0 0 rgba(217,119,6,0)', '0 0 0 8px rgba(217,119,6,0.1)', '0 0 0 0 rgba(217,119,6,0)'] }
                      : {}
                  }
                  transition={isFirst ? { repeat: Infinity, duration: 2.5 } : {}}
                >
                  <Icon size={16} />
                </motion.div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 rounded-lg p-4 ${
                  isFirst
                    ? 'bg-zinc-800/80 border border-zinc-700/50 backdrop-blur-sm'
                    : 'bg-zinc-900/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <span className={`font-semibold text-sm ${isFirst ? meta.textColor : 'text-zinc-400'}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDateTime(event.ocorrido_em)}
                  </span>
                </div>
                <p className={`text-sm ${isFirst ? 'text-zinc-200' : 'text-zinc-400'}`}>
                  {event.descricao}
                </p>
                {event.local_cidade && (
                  <p className="text-xs text-zinc-500 mt-1">
                    📍 {event.local_cidade}/{event.local_uf}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
