import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MessageSquare, Loader2 } from 'lucide-react';
import { formatDate, calcDuration } from '../utils/timeUtils';

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={13} className="sort-icon-default" />;
  return sortDir === 1
    ? <ChevronUp size={13} className="sort-icon-active" />
    : <ChevronDown size={13} className="sort-icon-active" />;
}

export default function CallTable({
  data, loading, totalFiltered, totalAll,
  sortCol, sortDir, onSort,
  page, pageSize, onPageChange, onPageSizeChange,
  onViewTranscript,
}) {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const cols = [
    { key: 'date', label: 'Date' },
    { key: 'mobile', label: 'Mobile No.' },
    { key: 'policy', label: 'Policy Number' },
    { key: 'name', label: 'Registered Name' },
    { key: 'start', label: 'Call Start' },
    { key: 'end', label: 'Call End' },
    { key: 'duration', label: 'Duration' },
    { key: 'disconnected', label: 'Status' },
    { key: 'reason', label: 'Reason', noSort: true },
    { key: 'transcript', label: 'Transcript', noSort: true },
  ];

  const pages = buildPageList(page, totalPages);

  return (
    <div className="table-panel">
      <div className="table-toolbar">
        <div className="result-meta">
          Showing <strong>{totalFiltered}</strong> of <strong>{totalAll}</strong> records
        </div>
        <div className="page-size-control">
          <span>Rows per page</span>
          <select
            className="filter-input filter-select"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            style={{ width: 68, padding: '5px 8px', fontSize: 12 }}
          >
            {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={c.noSort ? undefined : () => onSort(c.key)}
                  className={`${c.noSort ? '' : 'sortable'} ${sortCol === c.key ? 'sorted' : ''}`}
                >
                  <span>{c.label}</span>
                  {!c.noSort && <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="loading-cell">
                  <Loader2 size={20} className="spin" />
                  <span>Loading records…</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-cell">
                  <div className="empty-state">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No records match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : data.map(r => (
              <tr key={r.id}>
                <td className="td-date">{formatDate(r.date)}</td>
                <td className="td-mono">{r.mobile}</td>
                <td className="td-policy">{r.policy}</td>
                <td className="td-name">{r.name}</td>
                <td className="td-mono">{r.start}</td>
                <td className="td-mono">{r.end}</td>
                <td className="td-mono">{calcDuration(r.start, r.end)}</td>
                <td>
                  {r.disconnected === 'Yes'
                    ? <span className="badge badge-disconnected">Disconnected</span>
                    : <span className="badge badge-completed">Completed</span>
                  }
                </td>
                <td>
                  {r.reason
                    ? <span className="reason-tag" title={r.reason}>{r.reason}</span>
                    : <span className="td-empty">—</span>
                  }
                </td>
                <td>
                  <button className="btn-transcript" onClick={() => onViewTranscript(r)}>
                    <MessageSquare size={12} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="page-info">Page {page} of {totalPages}</div>
        <div className="page-btns">
          <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
          {pages.map((p, i) =>
            p === '...'
              ? <button key={`e${i}`} className="page-btn ellipsis" disabled>…</button>
              : <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >{p}</button>
          )}
          <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
        </div>
      </div>
    </div>
  );
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
