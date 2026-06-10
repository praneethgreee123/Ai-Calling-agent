import React from 'react';

export default function StatCard({ label, value, sub, variant = 'default', icon }) {
  const variantClass = {
    default: 'stat-default',
    green: 'stat-green',
    red: 'stat-red',
    amber: 'stat-amber',
  }[variant];

  return (
    <div className={`stat-card ${variantClass}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${variantClass}`}>{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
