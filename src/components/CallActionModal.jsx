import React, { useState } from 'react';
import './CallActionModal.css';

export default function CallActionModal({ isOpen, onClose }) {
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInitiateCall = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/calls/initiate?customer_id=${encodeURIComponent(customerId)}`, { 
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Validation Error: ${JSON.stringify(errorData.detail || errorData)}`);
      }

      alert('Call initiated successfully!');
      onClose();
    } catch (error) {
      console.error('Error initiating call:', error);
      alert(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Initiate Customer Call</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleInitiateCall} className="modal-body">
          <div className="form-group">
            <label htmlFor="customerId">Customer ID</label>
            <input 
              type="text" 
              id="customerId" 
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter Customer ID (e.g., CUST-12345)" 
              required 
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Calling...' : 'Initiate Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}