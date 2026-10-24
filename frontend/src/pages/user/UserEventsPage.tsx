import React, { useState } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Search,
  Sparkles
} from 'lucide-react';

export const UserEventsPage: React.FC = () => {
  const { events, toggleRSVP } = useClubData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Club Events & RSVPs</h1>
        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
          Discover hands-on workshops, technical talks, and hackathons. Confirm your attendance to reserve seating.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search events by title or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Category:</span>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Workshop">Workshops</option>
            <option value="Tech Talk">Tech Talks</option>
            <option value="Hackathon">Hackathons</option>
            <option value="General Body">General Body</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredEvents.map((evt) => {
          const isLive = evt.status === 'live';
          const isCompleted = evt.status === 'completed';

          return (
            <div
              key={evt.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isLive ? 'rgba(16, 185, 129, 0.4)' : undefined
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <Badge variant="brand">{evt.category}</Badge>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Sparkles size={13} /> +{evt.pointsAwarded} XP
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {evt.title}
                </h3>

                <p style={{ fontSize: '0.835rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {evt.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={14} color="#818cf8" />
                    <span>{evt.date} &bull; {evt.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={14} color="#818cf8" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>
                  {evt.rsvpCount} members attending
                </span>

                {isCompleted ? (
                  <span className="badge badge-neutral">Completed</span>
                ) : (
                  <button
                    onClick={() => toggleRSVP(evt.id)}
                    className={`btn btn-sm ${evt.userRsvpd ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {evt.userRsvpd ? (
                      <>
                        <CheckCircle2 size={13} color="var(--success)" /> Attending
                      </>
                    ) : (
                      'Reserve My Seat'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
