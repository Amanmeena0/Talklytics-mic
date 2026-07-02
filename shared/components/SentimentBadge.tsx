import React from 'react';
import classNames from 'classnames';

interface SentimentBadgeProps {
  sentiment: string;
}

const colorMap: Record<string, string> = {
  positive: 'bg-green-200 text-green-800',
  neutral: 'bg-gray-200 text-gray-800',
  negative: 'bg-red-200 text-red-800',
};

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const classes = classNames(
    'px-2 py-1 rounded-full text-sm font-medium',
    colorMap[sentiment.toLowerCase()] || 'bg-gray-200 text-gray-800'
  );
  return <span className={classes}>{sentiment}</span>;
}
