
import React from 'react';
import { Depth } from '../types';

interface DepthBadgeProps {
  depth: Depth;
}

export const DepthBadge: React.FC<DepthBadgeProps> = ({ depth }) => {
  const colors = {
    [Depth.BASIC]: "bg-slate-100 text-slate-700",
    [Depth.CONCEPTUAL]: "bg-purple-100 text-purple-700",
    [Depth.NUMERICAL]: "bg-orange-100 text-orange-700",
    [Depth.APPLICATION]: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${colors[depth]}`}>
      {depth}
    </span>
  );
};
