import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  ArrowUpDown,
  Check,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function DataTable({
  columns = [],
  data = [],
  searchKey = 'name',
  searchPlaceholder = 'Search records...',
  filterKey = null,
  filterOptions = [],
  actions = [],
  onRowClick = null,
  pageSize = 10,
  isLoading = false,
  emptyMessage = 'No records found'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [openActionRowId, setOpenActionRowId] = useState(null);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return (data || []).filter((item) => {
      // Search
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const val = item[searchKey] || '';
        const searchStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        matchesSearch = searchStr.toLowerCase().includes(searchTerm.toLowerCase());
      }

      // Dropdown Filter
      let matchesFilter = true;
      if (filterKey && selectedFilter !== 'ALL') {
        const itemVal = String(item[filterKey] || '').toUpperCase();
        matchesFilter = itemVal === selectedFilter.toUpperCase();
      }

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, searchKey, filterKey, selectedFilter]);

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const newSet = new Set(paginatedData.map((d, i) => d.id || d.userId || d.productId || d.propertyId || i));
      setSelectedRows(newSet);
    }
  };

  const toggleRowSelect = (id) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card, rgba(17, 24, 39, 0.7))',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Top Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted, #94a3b8)'
            }}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        {filterKey && filterOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted, #94a3b8)' }} />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Categories</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
              }}
            >
              <th style={{ width: '40px', padding: '12px 16px' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size > 0 && selectedRows.size === paginatedData.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  onClick={() => col.sortable !== false && handleSort(col.accessor || col.key)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--text-muted, #94a3b8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.header || col.label}
                    {col.sortable !== false && <ArrowUpDown size={12} style={{ opacity: 0.6 }} />}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th style={{ width: '60px', padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(59, 130, 246, 0.2)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                    <span>Loading data from API...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '48px', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--text-muted, #94a3b8)'
                    }}
                  >
                    <AlertCircle size={32} style={{ opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id || row.userId || row.productId || row.propertyId || row.queryId || idx;
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                      background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      transition: 'background 0.15s ease',
                      cursor: onRowClick ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelect(rowId)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    {columns.map((col) => {
                      const val = row[col.accessor || col.key];
                      return (
                        <td
                          key={col.key || col.accessor}
                          style={{
                            padding: '12px 16px',
                            fontSize: '0.875rem',
                            color: '#f1f5f9',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {col.render ? (
                            col.render(val, row)
                          ) : col.isStatus ? (
                            <StatusBadge status={val} />
                          ) : (
                            val !== undefined && val !== null ? String(val) : '—'
                          )}
                        </td>
                      );
                    })}
                    {actions.length > 0 && (
                      <td style={{ padding: '12px 16px', textAlign: 'right', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenActionRowId(openActionRowId === rowId ? null : rowId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openActionRowId === rowId && (
                          <div
                            style={{
                              position: 'absolute',
                              right: '16px',
                              top: '36px',
                              background: '#1e293b',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                              zIndex: 50,
                              minWidth: '140px',
                              overflow: 'hidden'
                            }}
                          >
                            {actions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  setOpenActionRowId(null);
                                  act.onClick(row);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '0.8125rem',
                                  color: act.danger ? '#ef4444' : '#e2e8f0',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                              >
                                {act.icon && <act.icon size={14} />}
                                {act.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          fontSize: '0.8125rem',
          color: 'var(--text-muted, #94a3b8)'
        }}
      >
        <div>
          Showing {paginatedData.length} of {sortedData.length} entries
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: currentPage === 1 ? '#475569' : '#f8fafc',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: currentPage >= totalPages ? '#475569' : '#f8fafc',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
