import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClubData } from '../../context/ClubDataContext';
import { Award, Lock, Trophy } from 'lucide-react';

export const UserBadgesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { achievements, members } = useClubData();

  const student = members.find(
    (member) =>
      member.id === currentUser?.id ||
      member.email === currentUser?.email
  );

  const totalPoints = student?.points ?? currentUser?.points ?? 0;
  const currentStreak = student?.currentStreak ?? currentUser?.streak ?? 0;
  const nextTierPoints = 1000;
  const pointsProgress = Math.min(
    100,
    Math.max(0, Math.round((totalPoints / nextTierPoints) * 100))
  );
  const pointsRemaining = Math.max(0, nextTierPoints - totalPoints);

  const sortedMembers = [...members].sort(
    (a, b) => b.points - a.points
  );

  const currentRank = student
    ? sortedMembers.findIndex((member) => member.id === student.id) + 1
    : 0;

  const leaderboard = sortedMembers.slice(0, 5);

  if (!currentUser) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        Please log in to view your badges and rewards.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>
          Badges, Streaks & Rewards
        </h1>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem' }}>
          Track your attendance progress, earned badges, and club ranking.
        </p>
      </div>

      <div
        className="card"
        style={{
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          padding: '1.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                flexShrink: 0,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <Trophy size={24} />
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                }}
              >
                {currentUser.tier ?? 'Member'} &bull; {totalPoints} XP
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {pointsRemaining > 0
                  ? `Need ${pointsRemaining} XP to reach the 1,000 XP milestone`
                  : 'You have reached the 1,000 XP milestone'}
              </div>
            </div>
          </div>

          <span className="badge badge-brand">
            {currentRank > 0 ? `Rank #${currentRank}` : 'Rank unavailable'}
          </span>
        </div>

        <div>
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pointsProgress}%`,
                background: 'var(--brand-gradient)',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.74rem',
              color: 'var(--text-dim)',
              marginTop: '0.45rem',
            }}
          >
            <span>
              Current: <strong>{totalPoints} XP</strong>
            </span>
            <span>
              Milestone: <strong>1,000 XP</strong> ({pointsProgress}%)
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Current attendance streak
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {currentStreak} 🔥
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Attendance badges unlocked
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {achievements.filter((badge) => badge.unlocked).length}
              {' / '}
              {achievements.length}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.75rem',
        }}
      >
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            minWidth: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              Attendance Badges
            </h3>
            <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
              View your unlocked badges and progress toward others.
            </p>
          </div>

          {achievements.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No badges are available yet.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
              }}
            >
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    padding: '1.15rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: badge.unlocked
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid ${
                      badge.unlocked
                        ? 'rgba(99, 102, 241, 0.3)'
                        : 'var(--border-subtle)'
                    }`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.5rem',
                    opacity: badge.unlocked ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: badge.unlocked
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: badge.unlocked ? '#818cf8' : 'var(--text-dim)',
                    }}
                  >
                    {badge.unlocked ? <Award size={22} /> : <Lock size={20} />}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    {badge.title}
                  </div>

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-dim)',
                      lineHeight: 1.35,
                    }}
                  >
                    {badge.description}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.45rem' }}>
                    {badge.unlocked ? (
                      <span
                        className="badge badge-success"
                        style={{ fontSize: '0.62rem' }}
                      >
                        Unlocked (+{badge.points} XP)
                      </span>
                    ) : (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        Progress: {badge.progress}/{badge.maxProgress}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            minWidth: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              Club Leaderboard
            </h3>
            <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
              Rankings based on the member points currently available.
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Leaderboard data is unavailable. Please try again later.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboard.map((member, index) => {
                const isCurrentUser =
                  member.id === currentUser.id ||
                  member.email === currentUser.email;

                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrentUser
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${
                        isCurrentUser
                          ? 'rgba(99, 102, 241, 0.35)'
                          : 'var(--border-subtle)'
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          flexShrink: 0,
                          borderRadius: '50%',
                          background:
                            index === 0
                              ? '#f59e0b'
                              : index === 1
                                ? '#94a3b8'
                                : index === 2
                                  ? '#b45309'
                                  : 'rgba(255, 255, 255, 0.05)',
                          color: index <= 2 ? '#000' : 'var(--text-dim)',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        #{index + 1}
                      </div>

                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`
                        }
                        alt={member.name}
                        onError={(event) => {
                          event.currentTarget.src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`;
                        }}
                        style={{
                          width: '34px',
                          height: '34px',
                          flexShrink: 0,
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {member.name}
                          {isCurrentUser && (
                            <span style={{ color: '#818cf8', fontSize: '0.75rem' }}>
                              {' '}(You)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {member.department || 'Department unavailable'} &bull;{' '}
                          {member.currentStreak ?? 0} 🔥 streak
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-main)',
                        }}
                      >
                        {member.points ?? 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        XP points
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};