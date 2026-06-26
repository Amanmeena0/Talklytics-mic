import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container/30 backdrop-blur-sm py-4 text-center text-sm text-gray-400">
      <div className="mx-auto max-w-7xl px-4">
        © {new Date().getFullYear()} ConvinceSense. All rights reserved.
      </div>
    </footer>
  );
}
