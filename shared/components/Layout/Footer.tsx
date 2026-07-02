import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      © {new Date().getFullYear()} ConvinceSense. All rights reserved.
    </footer>
  );
}
