import React, { useState, useMemo } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import type { Member } from '../../types';
import {
  Search,
  Filter,
  UserPlus,
  Flame,
  AlertTriangle,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Users,
} from 'lucide-react';

interface MemberManagementProps {
  selectedMemberId?: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ selectedMemberId }) => {
  const {
    members,
    addMember,
    updateMemberStatus,
    exportMembersCSV,
    isLoadingMembers,
    memberError,
    refreshMembers,
  } = useClubData();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeMemberModal, setActiveMemberModal] = useState<Member | null>(() => {
    if (selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || null;
    }
    return null;
  });
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New member form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science');
  const [newYear, setNewYear] = useState('Sophomore (2nd Year)');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = departmentFilter === 'ALL' || m.department === departmentFilter;
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [members, searchTerm, departmentFilter, statusFilter]);

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await addMember({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        studentId: newStudentId.trim() || undefined,
        department: newDepartment,
        year: newYear,
        status: 'active',
      });

      setNewName('');
      setNewEmail('');
      setNewStudentId('');
      setIsAddMemberOpen(false);
    } catch {
      // Handled by context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (member: Member, newStatus: 'active' | 'at-risk' | 'inactive') => {
    try {
      await updateMemberStatus(member.id, newStatus);
      if (activeMemberModal && activeMemberModal.id === member.id) {
        setActiveMemberModal({
          ...activeMemberModal,
          status: newStatus,
          riskLevel: newStatus === 'at-risk' ? 'high' : newStatus === 'inactive' ? 'high' : 'low',
        });
      }
    } catch {
      // Handled by context toast
    }
  };

  const handleSendReminder = (member: Member) => {
    showToast(
      'Engagement Alert Sent',
      `Sent motivational check-in note to ${member.name} (${member.email}).`,
      'success',
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Member Roster &amp; Health</h1>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Track real participation tiers, streaks, risk factors, and member attendance logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={refreshMembers}
            disabled={isLoadingMembers}
            className="btn btn-secondary"
            title="Refresh members from database"
          >
            <RefreshCw size={14} className={isLoadingMembers ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={exportMembersCSV}
            className="btn btn-outline"
          >
            <Download size={15} /> Export Roster (CSV)
          </button>
          <button
            type="button"
            onClick={() => setIsAddMemberOpen(true)}
            className="btn btn-primary"
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {memberError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            <span>{memberError}</span>
          </div>
          <button type="button" onClick={refreshMembers} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <Filter size={14} /> Department:
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="at-risk">At-Risk</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingMembers && members.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
          <RefreshCw size={36} className="spin" style={{ margin: '0 auto 1rem auto', color: 'var(--brand-400)' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading club members from database...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingMembers && members.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-dim)' }}>
          <Users size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.35 }} />
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontWeight: 700 }}>
            No Members Registered
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            Register new members to begin tracking participation rates, streaks, and attendance integrity.
          </p>
          <button type="button" onClick={() => setIsAddMemberOpen(true)} className="btn btn-primary">
            <UserPlus size={15} /> Add First Member
          </button>
        </div>
      )}

      {/* Members Table */}
      {members.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Student ID</th>
                <th>Department &amp; Year</th>
                <th>Attendance Rate</th>
                <th>Events Attended</th>
                <th>Current Streak</th>
                <th>Risk Profile</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={member.avatar}
                          alt={member.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: '0.745rem', color: 'var(--text-dim)' }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
                      {member.studentId}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.825rem' }}>{member.department}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{member.year}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '60px', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${member.attendanceRate}%`,
                              backgroundColor:
                                member.attendanceRate >= 75
                                  ? 'var(--success)'
                                  : member.attendanceRate >= 50
                                  ? 'var(--warning)'
                                  : 'var(--danger)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.825rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {member.attendanceRate}%
                        </span>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      <strong>{member.attendedEvents}</strong>
                      <span style={{ color: 'var(--text-dim)' }}> / {member.totalEvents}</span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Flame size={14} color="#f59e0b" />
                        <strong>{member.currentStreak}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>sessions</span>
                      </div>
                    </td>

                    <td>
                      <Badge
                        variant={
                          member.riskLevel === 'low'
                            ? 'success'
                            : member.riskLevel === 'medium'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {member.riskLevel} risk
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        variant={
                          member.status === 'active'
                            ? 'brand'
                            : member.status === 'at-risk'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {member.status}
                      </Badge>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMemberModal(member)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.745rem' }}
                      >
                        <Eye size={13} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Details Modal */}
      {activeMemberModal && (
        <Modal
          isOpen={!!activeMemberModal}
          onClose={() => setActiveMemberModal(null)}
          title={activeMemberModal.name}
          subtitle={`${activeMemberModal.studentId} • ${activeMemberModal.department}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Profile Overview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <img
                src={activeMemberModal.avatar}
                alt={activeMemberModal.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{activeMemberModal.name}</h4>
                  <Badge variant={activeMemberModal.status === 'active' ? 'success' : 'danger'}>
                    {activeMemberModal.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {activeMemberModal.email} &bull; {activeMemberModal.year}
                </div>
              </div>
            </div>

            {/* Attendance & Streak Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {activeMemberModal.attendanceRate}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Attendance Rate</div>
              </div>

              <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-400)', fontFamily: 'var(--font-mono)' }}>
                  {activeMemberModal.attendedEvents} / {activeMemberModal.totalEvents}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Events Attended</div>
              </div>

              <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                  {activeMemberModal.currentStreak}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Streak Count</div>
              </div>
            </div>

            {/* Risk Warnings */}
            {activeMemberModal.riskFactors.length > 0 && (
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ef4444', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <AlertTriangle size={14} /> At-Risk Attendance Factors
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {activeMemberModal.riskFactors.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attendance History Log */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                Attendance Record History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
                {activeMemberModal.attendanceHistory.length === 0 ? (
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
                    No session attendance recorded in database yet.
                  </div>
                ) : (
                  activeMemberModal.attendanceHistory.map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{rec.eventName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {rec.date} &bull; {rec.category}
                        </div>
                      </div>
                      <div>
                        {rec.status === 'present' ? (
                          <Badge variant="success" icon={<CheckCircle2 size={11} />}>Present</Badge>
                        ) : rec.status === 'excused' ? (
                          <Badge variant="warning" icon={<Clock size={11} />}>Excused</Badge>
                        ) : (
                          <Badge variant="danger" icon={<XCircle size={11} />}>Absent</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeMemberModal, 'active')}
                  className="btn btn-secondary btn-sm"
                >
                  Mark Active
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeMemberModal, 'at-risk')}
                  className="btn btn-secondary btn-sm"
                >
                  Flag At-Risk
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(activeMemberModal, 'inactive')}
                  className="btn btn-ghost btn-sm"
                >
                  Set Inactive
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendReminder(activeMemberModal)}
                className="btn btn-primary btn-sm"
              >
                <Mail size={13} /> Send Alert
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Register New Club Member"
        subtitle="Add a student to the official club membership database."
      >
        <form onSubmit={handleAddMemberSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Elena Rostova"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="student@university.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CP-9012"
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Systems">Information Systems</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class Year</label>
              <select
                className="form-select"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              >
                <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                <option value="Senior (4th Year)">Senior (4th Year)</option>
                <option value="Graduate / Alum">Graduate / Alum</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Registering...' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
