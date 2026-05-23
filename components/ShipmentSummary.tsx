'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Weight, ArrowRight } from 'lucide-react';
import { maskName, formatDate } from '@/lib/format';
import type { Shipment } from '@/lib/types';

interface ShipmentSummaryProps {
  shipment: Shipment;
}

export function ShipmentSummary({ shipment }: ShipmentSummaryProps) {
  const cards = [
    {
      icon: MapPin,
      label: 'Rota',
      value: (
        <div className="flex items-center gap-2 text-sm">
          <span>
            {shipment.remetente_cidade}/{shipment.remetente_uf}
          </span>
          <ArrowRight size={14} className="text-zinc-500 flex-shrink-0" />
          <span>
            {shipment.destinatario_cidade}/{shipment.destinatario_uf}
          </span>
        </div>
      ),
      sub: `${maskName(shipment.remetente_nome)} → ${maskName(shipment.destinatario_nome)}`,
    },
    {
      icon: Calendar,
      label: 'Previsão de Entrega',
      value: shipment.previsao_entrega
        ? formatDate(shipment.previsao_entrega)
        : 'Não informada',
      sub: `Serviço: ${shipment.servico}`,
    },
    {
      icon: Weight,
      label: 'Peso',
      value: `${shipment.peso_kg} kg`,
      sub: `Código: ${shipment.codigo}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + idx * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon size={16} className="text-amber-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <div className="text-zinc-100 font-medium">{card.value}</div>
          <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
