import { useState, useEffect, useCallback } from 'react';
import { timeToSec } from '../utils/timeUtils';

export function useCallLogs(filters, page, pageSize, sortCol, sortDir) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/dashboard/logs')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP error ${res.status}: ${text.substring(0, 150)}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text().catch(() => '');
          throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`);
        }
        return res.json();
      })
      .then(res => { 
        console.log("Raw API Response:", res);

        // 1. Safely extract the array
        let data = [];
        if (Array.isArray(res)) {
          data = res;
        } else if (res && typeof res === 'object') {
          // Try standard keys, or aggressively find the first array in the response object
          data = res.data || res.logs || res.items || res.call_logs || 
                 Object.values(res).find(v => Array.isArray(v)) || [];
        }
        
        // 2. Map the backend fields to exactly what the frontend UI expects
        const mappedData = data.map(item => {
          // Helper functions to safely parse dates and times from ISO timestamps
          const extractDate = (dt) => (typeof dt === 'string' && dt.includes('T')) ? dt.split('T')[0] : (dt || '');
          const extractTime = (dt) => (typeof dt === 'string' && dt.includes('T')) ? new Date(dt).toTimeString().split(' ')[0] : (dt || '00:00');

          // The backend sends the transcript as a stringified JSON array, so we must parse it
          let parsedTranscript = [];
          try {
            if (typeof item.transcript === 'string') {
              parsedTranscript = JSON.parse(item.transcript);
            } else if (Array.isArray(item.transcript)) {
              parsedTranscript = item.transcript;
            }
          } catch (e) {
            console.error("Failed to parse transcript for call", item.call_sid);
          }

          return {
            id: item.call_sid || Math.random().toString(),
            date: extractDate(item.date),
            mobile: item.mobile_no || 'N/A',
            policy: item.policy_number || 'N/A',
            name: item.registered_name || 'Unknown',
            start: extractTime(item.call_start),
            end: extractTime(item.call_end),
            disconnected: item.disconnected ? 'Yes' : 'No',
            reason: item.reason || '',
            
            // Standardize roles ('assistant' -> 'agent', 'user' -> 'customer', keep 'system')
            conversation: parsedTranscript.map(msg => ({
              role: msg.speaker === 'system' ? 'system' : (msg.speaker === 'assistant' ? 'agent' : 'customer'),
              time: extractTime(msg.time),
              text: msg.text || ''
            }))
          };
        });

        setAllData(mappedData); 
        setLoading(false); 
      })
      .catch(e => { 
        console.error("Data Fetch Error:", e);
        setError(e.message); 
        setLoading(false); 
      });
  }, []);

  const filtered = useCallback(() => {
    // Safely check if allData is an array before spreading
    const safeAllData = Array.isArray(allData) ? allData : [];
    let data = [...safeAllData];

    if (filters.dateFrom) data = data.filter(r => r.date >= filters.dateFrom);
    if (filters.dateTo) data = data.filter(r => r.date <= filters.dateTo);
    if (filters.mobile) data = data.filter(r => r.mobile.includes(filters.mobile));
    if (filters.policy) data = data.filter(r => r.policy.toLowerCase().includes(filters.policy.toLowerCase()));
    if (filters.disconnected) data = data.filter(r => r.disconnected === filters.disconnected);
    if (filters.timeFrom) data = data.filter(r => r.start >= filters.timeFrom);
    if (filters.timeTo) data = data.filter(r => r.start <= filters.timeTo);

    data.sort((a, b) => {
      let va, vb;
      switch (sortCol) {
        case 'date': va = a.date; vb = b.date; break;
        case 'mobile': va = a.mobile; vb = b.mobile; break;
        case 'policy': va = a.policy; vb = b.policy; break;
        case 'name': va = a.name; vb = b.name; break;
        case 'start': va = a.start; vb = b.start; break;
        case 'end': va = a.end; vb = b.end; break;
        case 'duration':
          va = timeToSec(a.end) - timeToSec(a.start);
          vb = timeToSec(b.end) - timeToSec(b.start);
          break;
        case 'disconnected': va = a.disconnected; vb = b.disconnected; break;
        default: va = a.date; vb = b.date;
      }
      if (va < vb) return -sortDir;
      if (va > vb) return sortDir;
      return 0;
    });

    return data;
  }, [allData, filters, sortCol, sortDir]);

  const filteredData = filtered();
  const totalFiltered = filteredData.length;
  const start = (page - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  const safeAllData = Array.isArray(allData) ? allData : [];
  const stats = {
    total: safeAllData.length,
    completed: safeAllData.filter(r => r.disconnected === 'No').length,
    disconnected: safeAllData.filter(r => r.disconnected === 'Yes').length,
    avgDuration: (() => {
      if (!safeAllData.length) return '—';
      const total = safeAllData.reduce((acc, r) => acc + (timeToSec(r.end) - timeToSec(r.start)), 0);
      const avg = Math.round(total / safeAllData.length);
      const m = Math.floor(avg / 60), s = avg % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    })(),
    today: safeAllData.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
  };

  return { pageData, filteredData, totalFiltered, stats, loading, error };
}
