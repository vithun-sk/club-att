import React, { useState } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import type { IntegrityLog } from '../../types';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Filter,
  ShieldCheck
} from 'lucide-react';

export const IntegrityMonitorPage: React.FC = () => {
  const { integrityLogs, resolveAnomaly, exportIntegrityCSV } = useClubData();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<IntegrityLog | null>(null);

  const filteredLogs = integrityLogs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const underReviewCount = integrityLogs.filter(
    (log) => log.status === 'under_review'
  ).length;

  const blockedIncidentCount = integrityLogs.filter(
    (log) => log.actionTaken.toLowerCase() === 'blocked'
  ).length;

  const handleResolve = (
    log: IntegrityLog,
    resolution: 'resolved' | 'dismissed'
  ) => {
    resolveAnomaly(log.id, resolution);

    if (selectedLog && selectedLog.id === log.id) {
      setSelectedLog({
        ...selectedLog,
        status: resolution
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>
              Integrity & Anti-Proxy Monitor
            </h1>
            <span className="badge badge-danger">
              {underReviewCount} Flagged
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Review recorded attendance-integrity incidents and investigate suspicious check-in attempts.
          </p>
        </div>

        <button onClick={exportIntegrityCSV} className="btn btn-outline">
          <Download size={15} /> Export Audit Log (CSV)
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Pending Anomaly Reviews
            </span>
            <ShieldAlert size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
            {underReviewCount}
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              marginTop: '0.2rem'
            }}
          >
            Incidents awaiting review in the available records
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Recorded Blocked Incidents
            </span>
            <ShieldCheck size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
            {blockedIncidentCount}
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              marginTop: '0.2rem'
            }}
          >
            Blocked actions among the available incident records
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Token Refresh Window
            </span>
            <Clock size={18} color="var(--brand-500)" />
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Not configured
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              marginTop: '0.2rem'
            }}
          >
            No refresh interval is configured in this page
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              marginRight: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Filter size={14} /> Filter Anomaly Type:
          </div>

          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'duplicate_scan', label: 'Duplicate QR Scans' },
            { id: 'expired_token', label: 'Expired Screenshots' },
            { id: 'geo_mismatch', label: 'Geo Mismatches' },
            { id: 'rapid_burst', label: 'Rapid Burst Attempts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.775rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Showing <strong>{filteredLogs.length}</strong> recorded incidents
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Incident Type</th>
              <th>Severity</th>
              <th>Student & ID</th>
              <th>Event</th>
              <th>Enforcement Action</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-dim)'
                  }}
                >
                  No recorded incidents match this filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div
                      style={{
                        fontSize: '0.785rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-dim)'
                      }}
                    >
                      {log.timestamp}
                    </div>
                  </td>

                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.865rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {log.type.replace(/_/g, ' ')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-dim)',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.description}
                    </div>
                  </td>

                  <td>
                    <Badge
                      variant={
                        log.severity === 'high'
                          ? 'danger'
                          : log.severity === 'medium'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {log.severity.toUpperCase()}
                    </Badge>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.865rem' }}>
                      {log.memberName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {log.studentId}
                    </div>
                  </td>

                  <td>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.eventName}
                    </div>
                  </td>

                  <td>
                    <Badge
                      variant={
                        log.actionTaken.toLowerCase() === 'blocked'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {log.actionTaken}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      variant={
                        log.status === 'resolved'
                          ? 'success'
                          : log.status === 'dismissed'
                            ? 'neutral'
                            : 'danger'
                      }
                    >
                      {log.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> Investigate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Incident Audit: ${selectedLog.id}`}
          subtitle={`Reported at ${selectedLog.timestamp}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Badge
                variant={
                  selectedLog.severity === 'high'
                    ? 'danger'
                    : selectedLog.severity === 'medium'
                      ? 'warning'
                      : 'info'
                }
              >
                {selectedLog.severity.toUpperCase()} SEVERITY
              </Badge>
              <Badge
                variant={
                  selectedLog.status === 'resolved'
                    ? 'success'
                    : selectedLog.status === 'dismissed'
                      ? 'neutral'
                      : 'danger'
                }
              >
                {selectedLog.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', margin: '0 0 0.35rem 0' }}>
                Incident Overview
              </h4>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  margin: 0
                }}
              >
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.evidenceDetails && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.785rem',
                  color: '#818cf8',
                  lineHeight: 1.5
                }}
              >
                <div
                  style={{
                    color: 'var(--text-dim)',
                    fontSize: '0.7rem',
                    marginBottom: '0.3rem',
                    textTransform: 'uppercase'
                  }}
                >
                  Evidence Details:
                </div>
                {selectedLog.evidenceDetails}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase'
                  }}
                >
                  Associated Student
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  {selectedLog.memberName}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {selectedLog.studentId}
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase'
                  }}
                >
                  Enforcement Action
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    marginTop: '0.2rem',
                    color: 'var(--danger)'
                  }}
                >
                  {selectedLog.actionTaken}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Recorded action
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={() => handleResolve(selectedLog, 'dismissed')}
                className="btn btn-secondary btn-sm"
                disabled={
                  selectedLog.status === 'resolved' ||
                  selectedLog.status === 'dismissed'
                }
              >
                <XCircle size={14} /> Dismiss False Positive
              </button>

              <button
                type="button"
                onClick={() => handleResolve(selectedLog, 'resolved')}
                className="btn btn-primary btn-sm"
                disabled={
                  selectedLog.status === 'resolved' ||
                  selectedLog.status === 'dismissed'
                }
              >
                <CheckCircle2 size={14} /> Resolve & Log Audit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};