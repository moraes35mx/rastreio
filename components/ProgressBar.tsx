'use client';

import { motion } from 'framer-motion';
import { STATUS_FLOW, STATUS_META, type Status } from '@/lib/status';

interface ProgressBarProps {
  currentStatus: Status;
}

export function ProgressBar({ currentStatus }: ProgressBarProps) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus as typeof STATUS_FLOW[number]);
  const meta = STATUS_META[currentStatus];
  const isException = meta.isException;

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800" />
          {/* Progress line */}
          <motion.div
            className="absolute top-5 left-0 h-0.5"
            style={{ backgroundColor: isException ? '#EF4444' : '#D97706' }}
            initial={{ width: '0%' }}
            animate={{
              width: isException
                ? '83%'
                : `${(currentIdx / (STATUS_FLOW.length - 1)) * 100}%`,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {STATUS_FLOW.map((status, idx) => {
            const stepMeta = STATUS_META[status];
            const Icon = stepMeta.icon;
            const isActive = !isException && idx <= currentIdx;
            const isCurrent = !isException && idx === currentIdx;

            return (
              <div key={status} className="flex flex-col items-center relative z-10">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isCurrent ? [1, 1.1, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.4,
                    scale: isCurrent
                      ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                      : {},
                  }}
                >
                  <Icon size={18} />
                </motion.div>
                <span
                  className={`text-xs mt-2 text-center max-w-[80px] ${
                    isActive ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {stepMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical compact */}
      <div className="md:hidden">
        <div className="flex flex-col gap-2">
          {STATUS_FLOW.map((status, idx) => {
            const stepMeta = STATUS_META[status];
            const Icon = stepMeta.icon;
            const isActive = !isException && idx <= currentIdx;
            const isCurrent = !isException && idx === currentIdx;

            return (
              <motion.div
                key={status}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  isCurrent
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : isActive
                      ? 'bg-zinc-800/50'
                      : 'opacity-40'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-amber-400' : 'text-zinc-600'}
                />
                <span
                  className={`text-sm ${
                    isActive ? 'text-zinc-200' : 'text-zinc-600'
                  }`}
                >
                  {stepMeta.label}
                </span>
                {isCurrent && (
                  <motion.div
                    className="ml-auto w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Exception banner */}
      {isException && (
        <motion.div
          className={`mt-4 px-4 py-3 rounded-lg border ${meta.color} ${meta.borderColor} ${meta.textColor}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <meta.icon size={18} />
            <span className="font-medium">{meta.label}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
