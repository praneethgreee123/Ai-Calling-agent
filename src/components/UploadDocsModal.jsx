import React, { useState } from 'react';
import './CallActionModal.css'; // Reusing the same modal styles

export default function UploadDocsModal({ isOpen, onClose }) {
  const [policyDoc, setPolicyDoc] = useState(null);
  const [productDoc, setProductDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedCustomerId, setUploadedCustomerId] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setUploadedCustomerId(null);
    setPolicyDoc(null);
    setProductDoc(null);
    onClose();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!policyDoc && !productDoc) {
      alert('Please select at least one document to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      let newCustomerId = null;

      if (policyDoc) {
        const policyData = new FormData();
        policyData.append('file', policyDoc); 
        const policyRes = await fetch('/api/upload/policy', {
          method: 'POST',
          body: policyData,
        });
        if (!policyRes.ok) throw new Error('Policy upload failed');
        const data = await policyRes.json().catch(() => ({}));
        newCustomerId = data.customer_id || data.customerId || data.id || newCustomerId;
      }

      if (productDoc) {
        const productData = new FormData();
        productData.append('file', productDoc);
        const productRes = await fetch('/api/upload/product', {
          method: 'POST',
          body: productData,
        });
        if (!productRes.ok) throw new Error('Product upload failed');
        const data = await productRes.json().catch(() => ({}));
        newCustomerId = data.customer_id || data.customerId || data.id || newCustomerId;
      }
      
      if (newCustomerId) {
        setUploadedCustomerId(newCustomerId);
      } else {
        // Fallback if no ID is returned by the API but upload succeeds
        setUploadedCustomerId('UPLOAD-SUCCESS');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Customer Documents</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        
        {uploadedCustomerId ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', color: '#16a34a', marginBottom: '16px' }}>✓</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Upload Successful</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              The documents have been successfully uploaded and processed.
            </p>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'inline-block' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Customer ID</span>
              <strong style={{ fontSize: '20px', color: '#0f172a', fontFamily: "'DM Mono', monospace" }}>{uploadedCustomerId}</strong>
            </div>
            <div className="modal-footer" style={{ marginTop: '32px', justifyContent: 'center' }}>
              <button type="button" className="btn-primary" onClick={handleClose}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="modal-body">
            <div className="form-group">
              <label htmlFor="policyDoc">Upload Policy Document</label>
              <input 
                type="file" 
                id="policyDoc" 
                onChange={(e) => setPolicyDoc(e.target.files[0])}
                accept=".pdf,.doc,.docx"
              />
            </div>

            <div className="form-group">
              <label htmlFor="productDoc">Upload Product Document</label>
              <input 
                type="file" 
                id="productDoc" 
                onChange={(e) => setProductDoc(e.target.files[0])}
                accept=".pdf,.doc,.docx"
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Upload Documents'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}