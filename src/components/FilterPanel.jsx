import React from 'react';
import { Search, X, Download, SlidersHorizontal } from 'lucide-react';

export default function FilterPanel({ filters, onChange, onClear, onExport }) {
  const handle = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <SlidersHorizontal size={15} strokeWidth={2} />
          Filters &amp; Search
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          <X size={13} /> Clear all
        </button>
      </div>

      <div className="filter-panel-body">
        {/* Row 1: Date + Time */}
        <div className="filter-section-label">Date Range</div>
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dateFrom}
              onChange={handle('dateFrom')}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dateTo}
              onChange={handle('dateTo')}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">From Time</label>
            <input
              type="time"
              className="filter-input"
              value={filters.timeFrom}
              onChange={handle('timeFrom')}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Time</label>
            <input
              type="time"
              className="filter-input"
              value={filters.timeTo}
              onChange={handle('timeTo')}
            />
          </div>
        </div>

        {/* Row 2: Search + Status + Export */}
        <div className="filter-section-label" style={{ marginTop: '16px' }}>Search &amp; Status</div>
        <div className="filter-row" style={{ alignItems: 'flex-end' }}>
          <div className="filter-group filter-search">
            <label className="filter-label">Mobile Number</label>
            <div className="input-with-icon">
              <Search size={14} className="input-icon" />
              <input
                type="text"
                className="filter-input has-icon"
                placeholder="e.g. 98765…"
                value={filters.mobile}
                onChange={handle('mobile')}
              />
            </div>
          </div>
          <div className="filter-group filter-search">
            <label className="filter-label">Policy Number</label>
            <div className="input-with-icon">
              <Search size={14} className="input-icon" />
              <input
                type="text"
                className="filter-input has-icon"
                placeholder="e.g. POL-2024-…"
                value={filters.policy}
                onChange={handle('policy')}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Call Status</label>
            <select
              className="filter-input filter-select"
              value={filters.disconnected}
              onChange={handle('disconnected')}
            >
              <option value="">All Calls</option>
              <option value="No">Completed</option>
              <option value="Yes">Disconnected</option>
            </select>
          </div>
          <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-export" onClick={onExport}>
              <Download size={14} />
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
