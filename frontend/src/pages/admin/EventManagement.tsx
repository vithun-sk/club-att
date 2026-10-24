import React, { useState } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import type { EventItem, EventCategory, ActivePage } from '../../types';
import {
  Calendar,
  MapPin,
  Plus,
  QrCode,
  Edit2,
  CheckCircle2,
  Filter,
  Play,
  RotateCcw,
  Download
} from 'lucide-react';

interface EventManagementProps {
  onNavigate: (page: ActivePage) => void;
}

export const EventManagement: React.FC<EventManagementProps> = ({ onNavigate }) => {
  const { events, addEvent, updateEvent, exportEventsCSV } = useClubData();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshop');
  const [date, setDate] = useState('2026-11-25');
  const [time, setTime] = useState('17:00 - 19:00');
  const [location, setLocation] = useState('Innovation Lab Hall B');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(80);
  const [pointsAwarded, setPointsAwarded] = useState(50);
  const [qrRefreshInterval, setQrRefreshInterval] = useState(10);

  const filteredEvents = events.filter((e) => {
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  const handleOpenCreate = () => {
    setTitle('');
    setCategory('Workshop');
    setDate('2026-11-25');
    setTime('17:00 - 19:00');
    setLocation('Innovation Lab Hall B');
    setDescription('Interactive hands-on session focusing on core developer skills.');
    setCapacity(80);
    setPointsAwarded(50);
    setQrRefreshInterval(10);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Validation Error', 'Event title is required.', 'error');
      return;
    }

    addEvent({
      title,
      category,
      date,
      time,
      location,
      status: 'upcoming',
      description,
      capacity: Number(capacity),
      rsvpCount: 0,
      pointsAwarded: Number(pointsAwarded),
      qrRefreshInterval: Number(qrRefreshInterval)
    });

    setIsCreateOpen(false);
  };

  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    updateEvent(editingEvent.id, {
      title: editingEvent.title,
      category: editingEvent.category,
      date: editingEvent.date,
      time: editingEvent.time,
      location: editingEvent.location,
      description: editingEvent.description,
      capacity: Number(editingEvent.capacity),
      pointsAwarded: Number(editingEvent.pointsAwarded),
      qrRefreshInterval: Number(editingEvent.qrRefreshInterval),
      status: editingEvent.status
    });

    setEditingEvent(null);
  };

  const handleSetStatus = (event: EventItem, newStatus: 'upcoming' | 'live' | 'completed' | 'cancelled') => {
    updateEvent(event.id, { status: newStatus });
    if (newStatus === 'live') {
      showToast('Session Started', `"${event.title}" is now LIVE! Redirecting to QR Display.`, 'success');
      onNavigate('qr-live');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Event & Session Hub</h1>
          <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
            Schedule club workshops, monitor RSVPs, and broadcast rotating QR stations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={exportEventsCSV}
            className="btn btn-outline"
          >
            <Download size={15} /> Export Events (CSV)
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={14} /> Filter Status:
          </div>

          {(['ALL', 'live', 'upcoming', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.785rem' }}
            >
              {st === 'ALL' ? 'All Events' : st}
              {st === 'live' && <span className="pulse-indicator" style={{ marginLeft: '4px' }} />}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Showing <strong>{filteredEvents.length}</strong> events
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredEvents.map((event) => {
          const isLive = event.status === 'live';
          const isCompleted = event.status === 'completed';
          const isUpcoming = event.status === 'upcoming';
          const attendancePercent = event.capacity > 0 ? Math.round((event.actualAttendance / event.capacity) * 100) : 0;

          return (
            <div
              key={event.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isLive ? 'rgba(16, 185, 129, 0.4)' : undefined,
                background: isLive
                  ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-surface) 100%)'
                  : 'var(--bg-surface)'
              }}
            >
              <div>
                {/* Status & Category Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <Badge variant="brand">{event.category}</Badge>
                  <Badge
                    variant={
                      isLive
                        ? 'success'
                        : isCompleted
                        ? 'neutral'
                        : isUpcoming
                        ? 'info'
                        : 'danger'
                    }
                  >
                    {isLive && <span className="pulse-indicator" />}
                    {event.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {event.title}
                </h3>

                <p style={{ fontSize: '0.835rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {event.description}
                </p>

                {/* Date & Location Metas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={14} color="#818cf8" />
                    <span>{event.date} &bull; {event.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={14} color="#818cf8" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Capacity & Attendance Visual */}
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Attendance & Capacity</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {event.actualAttendance} / {event.capacity} ({attendancePercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, attendancePercent)}%`,
                        backgroundColor: isLive ? 'var(--success)' : 'var(--brand-500)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                    <span>RSVPs: {event.rsvpCount}</span>
                    <span>+{event.pointsAwarded} XP reward</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="btn btn-outline btn-sm"
                    title="Edit event details"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  {isUpcoming && (
                    <button
                      onClick={() => handleSetStatus(event, 'live')}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      <Play size={13} /> Start Live
                    </button>
                  )}

                  {isLive && (
                    <button
                      onClick={() => handleSetStatus(event, 'completed')}
                      className="btn btn-secondary btn-sm"
                    >
                      <CheckCircle2 size={13} /> Complete
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => handleSetStatus(event, 'upcoming')}
                      className="btn btn-ghost btn-sm"
                      title="Reopen event"
                    >
                      <RotateCcw size={13} /> Reopen
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('qr-live')}
                  className="btn btn-secondary btn-sm"
                >
                  <QrCode size={13} /> QR Screen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule New Club Event"
        subtitle="Configure event logistics, points incentives, and QR rotation timers."
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. System Architecture Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
              >
                <option value="Workshop">Workshop</option>
                <option value="Tech Talk">Tech Talk</option>
                <option value="Hackathon">Hackathon</option>
                <option value="General Body">General Body</option>
                <option value="Social">Social</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Points Awarded (XP)</label>
              <input
                type="number"
                required
                className="form-input"
                value={pointsAwarded}
                onChange={(e) => setPointsAwarded(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="17:00 - 19:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Room</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Auditorium Hall B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity (Seats)</label>
              <input
                type="number"
                required
                className="form-input"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>QR Code Rotation Cadence (seconds)</span>
              <span style={{ color: 'var(--brand-500)', fontWeight: 600 }}>{qrRefreshInterval}s refresh</span>
            </label>
            <input
              type="number"
              min={5}
              max={60}
              required
              className="form-input"
              value={qrRefreshInterval}
              onChange={(e) => setQrRefreshInterval(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Outline topics covered and prerequisite tools..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Event Modal */}
      {editingEvent && (
        <Modal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          title="Edit Event"
          subtitle={`Editing "${editingEvent.title}"`}
        >
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live (Active Session)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editingEvent.category}
                  onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Tech Talk">Tech Talk</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="General Body">General Body</option>
                  <option value="Social">Social</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={editingEvent.capacity}
                  onChange={(e) => setEditingEvent({ ...editingEvent, capacity: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Points (XP)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={editingEvent.pointsAwarded}
                  onChange={(e) => setEditingEvent({ ...editingEvent, pointsAwarded: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Update Event
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
