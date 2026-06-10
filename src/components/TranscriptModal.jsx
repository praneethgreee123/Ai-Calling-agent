import React, { useEffect, useRef } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { formatDate, calcDuration } from '../utils/timeUtils';

export default function TranscriptModal({ record, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!record) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [record]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!record) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Separate the chat from the system token message
  const chatMsgs = record.conversation.filter(m => m.role !== 'system');
  const systemMsg = record.conversation.find(m => m.role === 'system');

  // Parse token usage dynamically (e.g., "Token Usage - Input: 10 | Output: 20")
  let tokenStats = [];
  if (systemMsg && systemMsg.text) {
    const rawText = systemMsg.text;
    
    if (rawText.includes('Token Usage Summary:') || rawText.includes('\n-')) {
      // New format (multiline with dashes)
      const lines = rawText.split('\n').filter(line => line.trim().startsWith('-'));
      tokenStats = lines.map(line => {
        const cleanLine = line.replace(/^-\s*/, '').trim();
        const splitIndex = cleanLine.indexOf(':');
        if (splitIndex > -1) {
          return {
            label: cleanLine.substring(0, splitIndex).trim(),
            value: cleanLine.substring(splitIndex + 1).trim()
          };
        }
        return null;
      }).filter(Boolean);
    } else {
      // Old format fallback (e.g., "Token Usage - Input: 10 | Output: 20")
      const cleanText = rawText.replace(/Token Usage\s*[-—]\s*/i, '');
      const parts = cleanText.split('|').map(p => p.trim());
      tokenStats = parts.map(part => {
        const splitIndex = part.indexOf(':');
        if (splitIndex > -1) {
          return {
             label: part.substring(0, splitIndex).trim(),
             value: part.substring(splitIndex + 1).trim()
          };
        }
        return { label: '', value: '' };
      }).filter(stat => stat.label && stat.value);
      
      if (tokenStats.length === 0) {
        tokenStats = [{ label: 'Usage', value: cleanText }];
      }
    }
  }

  function downloadTxt() {
    const lines = [
      ' INSURANCE — CALL TRANSCRIPT',
      '='.repeat(52),
      `Policy Number : ${record.policy}`,
      `Customer Name : ${record.name}`,
      `Mobile Number : ${record.mobile}`,
      `Date          : ${formatDate(record.date)}`,
      `Call Start    : ${record.start}`,
      `Call End      : ${record.end}`,
      `Duration      : ${calcDuration(record.start, record.end)}`,
      `Status        : ${record.disconnected === 'Yes' ? `Disconnected (${record.reason})` : 'Completed'}`,
      ...(systemMsg ? [`Token Usage   : ${systemMsg.text}`] : []),
      '='.repeat(52),
      '',
      'CONVERSATION',
      '-'.repeat(52),
      ...chatMsgs.map(m => `[${m.time}] ${m.role.toUpperCase()}: ${m.text}`),
      '',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
    ];
    triggerDownload(`transcript_${record.policy}.txt`, lines.join('\n'), 'text/plain');
  }

  function downloadJSON() {
    const obj = {
      metadata: {
        policyNumber: record.policy,
        customerName: record.name,
        mobileNumber: record.mobile,
        date: record.date,
        callStartTime: record.start,
        callEndTime: record.end,
        duration: calcDuration(record.start, record.end),
        status: record.disconnected === 'Yes' ? 'disconnected' : 'completed',
        disconnectionReason: record.reason || null,
        tokenUsage: systemMsg ? systemMsg.text : null,
        exportedAt: new Date().toISOString(),
      },
      conversation: chatMsgs.map(m => ({
        role: m.role,
        timestamp: m.time,
        message: m.text,
      })),
    };
    triggerDownload(`call_${record.policy}.json`, JSON.stringify(obj, null, 2), 'application/json');
  }

  function triggerDownload(filename, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
  }

  const duration = calcDuration(record.start, record.end);

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-title">{record.name}</div>
            <div className="modal-chips">
              <span className="modal-chip chip-policy">{record.policy}</span>
              <span className="modal-chip chip-date">{formatDate(record.date)}</span>
              <span className="modal-chip chip-time">{record.start} → {record.end}</span>
              <span className="modal-chip chip-dur">{duration}</span>
              <span className={`modal-chip ${record.disconnected === 'Yes' ? 'chip-disc' : 'chip-ok'}`}>
                {record.disconnected === 'Yes' ? `⚠ ${record.reason || 'Disconnected'}` : '✓ Completed'}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="conversation" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
            {chatMsgs.map((msg, i) => {
              const isAgent = msg.role === 'agent';
              return (
                <div key={i} className={`msg msg-${msg.role}`} style={{ 
                  display: 'flex', 
                  flexDirection: isAgent ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: '12px',
                  animationDelay: `${i * 0.04}s` 
                }}>
                  <div className={`msg-avatar avatar-${msg.role}`} style={{
                    width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 'bold', fontSize: '13px', flexShrink: 0,
                    backgroundColor: isAgent ? '#dbeafe' : '#dcfce7',
                    color: isAgent ? '#1e40af' : '#166534'
                  }}>
                    {isAgent ? 'AG' : 'CX'}
                  </div>
                  <div className="msg-content" style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isAgent ? 'flex-start' : 'flex-end',
                    maxWidth: '80%'
                  }}>
                    <div className={`msg-label label-${msg.role}`} style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'baseline', flexDirection: isAgent ? 'row' : 'row-reverse' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{isAgent ? 'Agent' : 'Customer'}</span>
                      <span className="msg-time" style={{ fontSize: '11px', color: '#94a3b8' }}>{msg.time}</span>
                    </div>
                    <div className="msg-bubble" style={{
                      padding: '12px 16px',
                      backgroundColor: isAgent ? '#eff6ff' : '#f0fdf4',
                      color: isAgent ? '#1e3a8a' : '#14532d',
                      borderRadius: isAgent ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      lineHeight: '1.5', fontSize: '14px', wordBreak: 'break-word'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div className="token-stats" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tokenStats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{stat.label}</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>{stat.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={downloadTxt} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Download .txt
            </button>
            <button className="btn btn-primary" onClick={downloadJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
