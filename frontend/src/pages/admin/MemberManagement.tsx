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
  Download
} from 'lucide-react';

interface MemberManagementProps {
  selectedMemberId?: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ selectedMemberId }) => {
  const { members, addMember, updateMemberStatus, exportMembersCSV } = useClubData();
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

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newStudentId) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    addMember({
      name: newName,
      email: newEmail,
      studentId: newStudentId,
      department: newDepartment,
      year: newYear,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      joinedDate: new Date().toISOString().slice(0, 10),
      riskLevel: 'low',
      riskFactors: [],
      status: 'active'
    });

    setNewName('');
    setNewEmail('');
    setNewStudentId('');
    setIsAddMemberOpen(false);
  };

  const handleSendReminder = (member: Member) => {
    showToast(
      'Engagement Alert Sent',
      `Sent motivational check-in note to ${member.name} (${member.email}).`,
      'success'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Member Roster & Health</h1>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Track participation tiers, streaks, risk factors, and member attendance logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={exportMembersCSV}
            className="btn btn-outline"
          >
            <Download size={15} /> Export Roster (CSV)
          </button>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="btn btn-primary"
          >
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by name, student ID, or campus email..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
            <Filter size={15} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Data Science">Data Science</option>
            <option value="Artificial Intelligence">AI & ML</option>
            <option value="Information Tech">Information Tech</option>
            <option value="Mechanical Eng.">Mechanical Eng.</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="at-risk">At-Risk Members</option>
            <option value="inactive">Inactive Members</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Member Details</th>
              <th>Department & Year</th>
              <th>Attendance Rate</th>
              <th>Current Streak</th>
              <th>Risk Level</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No members found matching your search or filters.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.885rem' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.745rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {member.studentId} &bull; {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.845rem', color: 'var(--text-main)' }}>{member.department}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{member.year}</div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '55px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${member.attendanceRate}%`,
                            backgroundColor:
                              member.attendanceRate >= 75
                                ? 'var(--success)'
                                : member.attendanceRate >= 60
                                ? 'var(--warning)'
                                : 'var(--danger)'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                        {member.attendanceRate}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                      {member.attendedEvents} of {member.totalEvents} events
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.84rem', color: member.currentStreak > 0 ? '#f59e0b' : 'var(--text-dim)' }}>
                      <Flame size={14} />
                      <span>{member.currentStreak} events</span>
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
                border: '1px solid var(--border-subtle)'
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeMemberModal.email} &bull; Joined {activeMemberModal.joinedDate}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-500)', fontFamily: 'var(--font-mono)' }}>
                  {activeMemberModal.points}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Club Points</div>
              </div>
            </div>

            {/* Attendance & Streak Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {activeMemberModal.attendanceRate}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Attendance Rate</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                  {activeMemberModal.currentStreak} 🔥
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Consecutive Streak</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {activeMemberModal.attendedEvents}/{activeMemberModal.totalEvents}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Sessions Attended</div>
              </div>
            </div>

            {/* Risk Factor Explainability */}
            {activeMemberModal.riskFactors.length > 0 && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={15} /> Identified Retention Risk Signals
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.785rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {activeMemberModal.riskFactors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attendance History Log */}
            <div>
              <h5 style={{ fontSize: '0.885rem', margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                Session History
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
                {activeMemberModal.attendanceHistory.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '0.5rem' }}>
                    No recorded session history yet for this member.
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
                        fontSize: '0.8rem'
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
                  onClick={() => {
                    updateMemberStatus(activeMemberModal.id, 'active');
                    setActiveMemberModal({ ...activeMemberModal, status: 'active', riskLevel: 'low' });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Mark Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateMemberStatus(activeMemberModal.id, 'at-risk');
                    setActiveMemberModal({ ...activeMemberModal, status: 'at-risk', riskLevel: 'high' });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Flag At-Risk
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendReminder(activeMemberModal)}
                className="btn btn-primary btn-sm"
              >
                <Mail size={14} /> Send Personalized Note
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add New Club Member"
        subtitle="Register a new student to the official club roster."
      >
        <form onSubmit={handleAddMemberSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Sanya Mirza"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Campus Email</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="sanya.m@campus.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID / Roll No</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="CS2025-108"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">AI & ML</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Mechanical Eng.">Mechanical Eng.</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select
              className="form-select"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            >
              <option value="Freshman (1st Year)">Freshman (1st Year)</option>
              <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
              <option value="Junior (3rd Year)">Junior (3rd Year)</option>
              <option value="Senior (4th Year)">Senior (4th Year)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
