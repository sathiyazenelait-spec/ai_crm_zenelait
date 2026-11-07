import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Globe,
  Trash2,
  RefreshCw,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

export function KnowledgeBaseView() {
  const { documents, setActiveModal, addNotification } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Knowledge Base</h1>
          <p>Train your AI agents with company documentation, URLs, and pricing sheets</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveModal('uploadDoc')}
        >
          <Upload size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div className="search-bar-wrapper" style={{ maxWidth: '320px' }}>
              <Search size={16} />
              <input
                type="text"
                className="search-bar-input"
                placeholder="Search knowledge docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '150px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="PDF">PDF Documents</option>
              <option value="DOCX">Word Documents</option>
              <option value="URL">Live URL Sync</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981' }}>
            <CheckCircle2 size={15} />
            <span>AI Embeddings Vector DB Synced</span>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Format</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: doc.type === 'PDF' ? 'rgba(239, 68, 68, 0.12)' : doc.type === 'DOCX' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: doc.type === 'PDF' ? '#ef4444' : doc.type === 'DOCX' ? '#3b82f6' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {doc.type === 'URL' ? <Globe size={16} /> : <FileText size={16} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>{doc.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {doc.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{doc.size}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{doc.uploadedBy}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{doc.lastUpdated}</td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Re-sync Vectors in TiDB Cloud"
                        onClick={() => addNotification && addNotification({
                          type: 'success',
                          title: `Re-indexed 768-dim vector embeddings for "${doc.title}"`
                        })}
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
