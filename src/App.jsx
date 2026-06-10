import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Phone, CheckCircle, XCircle, Clock, Calendar, Upload } from 'lucide-react';

import StatCard from './components/StatCard';
import FilterPanel from './components/FilterPanel';
import CallTable from './components/CallTable';
import TranscriptModal from './components/TranscriptModal';
import CallActionModal from './components/CallActionModal';
import UploadDocsModal from './components/UploadDocsModal';
import { useCallLogs } from './hooks/useCallLogs';
import { formatDate, calcDuration } from './utils/timeUtils';

const DEFAULT_FILTERS = {
  dateFrom: '', dateTo: '',
  timeFrom: '', timeTo: '',
  mobile: '', policy: '',
  disconnected: '',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', fontFamily: 'sans-serif', margin: '24px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>UI Crashed! Here is the hidden error:</h2>
          <pre style={{ overflowX: 'auto', fontWeight: 'bold' }}>{this.state.error?.toString()}</pre>
          <pre style={{ overflowX: 'auto', fontSize: '12px' }}>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardApp() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState(-1);
  const [activeRecord, setActiveRecord] = useState(null);
  const [clock, setClock] = useState(() => new Date());
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Live clock
  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { pageData = [], filteredData = [], totalFiltered = 0, stats, loading, error } = useCallLogs(
    filters, page, pageSize, sortCol, sortDir
  ) || {};

  const handleSort = useCallback((col) => {
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d * -1);
      else { setSortDir(1); }
      return col;
    });
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleExport = useCallback(() => {
    const headers = ['Date', 'Mobile No.', 'Policy Number', 'Registered Name',
      'Call Start', 'Call End', 'Duration', 'Status', 'Reason'];
    const rows = (filteredData || []).map(r => [
      r.date, r.mobile, r.policy, r.name,
      r.start, r.end, calcDuration(r.start, r.end),
      r.disconnected === 'Yes' ? 'Disconnected' : 'Completed',
      r.reason || '',
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [12, 14, 18, 20, 10, 10, 10, 14, 20].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, 'Call Records');
    XLSX.writeFile(wb, `calls_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredData]);

  const clockStr = clock.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">🛡</div>
          <div>
            <div className="logo-name">Insurance</div>
            <div className="logo-tagline">Call Agent Dashboard</div>
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              marginRight: '12px', padding: '8px 16px', background: '#f1f5f9', 
              color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', 
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: 'flex', 
              alignItems: 'center', gap: '8px'
            }}
          >
            <Upload size={16} /> Upload Docs
          </button>
          <button 
            onClick={() => setIsCallModalOpen(true)}
            style={{
              marginRight: '16px', padding: '8px 16px', background: '#2563eb', 
              color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', 
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: 'flex', 
              alignItems: 'center', gap: '8px'
            }}
          >
            <Phone size={16} /> Initiate Call
          </button>
          <div className="live-badge">
            <span className="live-dot" />
            Live
          </div>
          <div className="header-clock">{clockStr}</div>
        </div>
      </header>

      <main className="main">
        {error && (
          <div style={{ padding: '16px', marginBottom: '24px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171' }}>
            <strong>Failed to load data:</strong> {error}
          </div>
        )}

        {/* STATS */}
        <div className="stats-grid">
          <StatCard label="Total Calls" value={loading ? '—' : (stats?.total ?? '—')} sub="All time" variant="amber" icon={<Phone size={18} />} />
          <StatCard label="Completed" value={loading ? '—' : (stats?.completed ?? '—')} sub="Successful" variant="green" icon={<CheckCircle size={18} />} />
          <StatCard label="Disconnected" value={loading ? '—' : (stats?.disconnected ?? '—')} sub="Dropped calls" variant="red" icon={<XCircle size={18} />} />
          <StatCard label="Avg Duration" value={loading ? '—' : (stats?.avgDuration ?? '—')} sub="Per call (mm:ss)" icon={<Clock size={18} />} />
          <StatCard label="Today's Calls" value={loading ? '—' : (stats?.today ?? '—')} sub="Current date" variant="amber" icon={<Calendar size={18} />} />
        </div>

        {/* FILTERS */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
          onExport={handleExport}
        />

        {/* TABLE */}
        <CallTable
          data={pageData || []}
          loading={loading}
          totalFiltered={totalFiltered}
          totalAll={stats?.total || 0}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          onViewTranscript={setActiveRecord}
        />
      </main>

      <TranscriptModal record={activeRecord} onClose={() => setActiveRecord(null)} />
      <CallActionModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} />
      <UploadDocsModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DashboardApp />
    </ErrorBoundary>
  );
}
