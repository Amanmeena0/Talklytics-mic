import React from 'react';
import classNames from 'classnames';

interface SignalChipsProps {
  buyingSignals: string[];
  hesitations: string[];
}

export default function SignalChips({ buyingSignals, hesitations }: SignalChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {buyingSignals.map((s) => (
        <span key={s} className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
          {s}
        </span>
      ))}
      {hesitations.map((h) => (
        <span key={h} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">
          {h}
        </span>
      ))}
    </div>
  );
}
