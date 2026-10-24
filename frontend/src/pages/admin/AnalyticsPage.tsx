import React, { useState } from 'react';
import { useClubData } from '../../context/ClubDataContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { RiskScoreGauge } from '../../components/charts/RiskScoreGauge';
import {
  TrendingUp,
  AlertTriangle,
  Sliders,
  Sparkles
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { members } = useClubData();

  const lowRisk = members.filter((m) => m.riskLevel === 'low');
  const medRisk = members.filter((m) => m.riskLevel === 'medium');
  const highRisk = members.filter((m) => m.riskLevel === 'high');

  const avgAttendance = Math.round(
    members.reduce((acc, m) => acc + m.attendanceRate, 0) / Math.max(1, members.length)
  );

  // What-If Calculator interactive states
  const [extraWorkshops, setExtraWorkshops] = useState<number>(2);
  const [rewardMultiplier, setRewardMultiplier] = useState<number>(1.5);
  const [targetGoal, setTargetGoal] = useState<number>(85);

  // Dynamic what-if calculations
  // Extra workshops boost attendance by ~2.8% each, reward multiplier adds up to 6%, clamped
  const projectedBoost = Math.round(extraWorkshops * 2.8 + (rewardMultiplier - 1.0) * 8.5);
  const projectedAttendance = Math.min(98, avgAttendance + projectedBoost);
  const projectedRescued = Math.min(
    highRisk.length,
    Math.round(highRisk.length * (0.35 + extraWorkshops * 0.15 + (rewardMultiplier - 1.0) * 0.2))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', margin: 0, fontWeight: 800 }}>Engagement & Retention Analytics</h1>
        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
          Explainable risk signals, cohort breakdowns, and interactive What-If attendance modeling.
        </p>
      </div>

      {/* Top 3 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Cohort Health Index"
          value="88.4 / 100"
          change="+4.2 pts"
          trend="up"
          subtitle="composite score"
          icon={<Sparkles size={20} />}
        />

        <StatCard
          title="Retention Predictor"
          value={`${Math.round(((members.length - highRisk.length) / members.length) * 100)}%`}
          change="+7.1%"
          trend="up"
          subtitle="likely semester retention"
          icon={<TrendingUp size={20} />}
        />

        <StatCard
          title="At-Risk Member Ratio"
          value={`${Math.round((highRisk.length / members.length) * 100)}%`}
          change={highRisk.length > 2 ? "+2 this cycle" : "Low risk"}
          trend={highRisk.length > 2 ? "down" : "up"}
          subtitle={`${highRisk.length} flagged of ${members.length}`}
          icon={<AlertTriangle size={20} color={highRisk.length > 0 ? 'var(--danger)' : 'var(--success)'} />}
        />
      </div>

      {/* What-If Attendance Calculator Interactive Sandbox */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'var(--border-highlight)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              <Sliders size={18} /> Interactive "What-If" Retention Simulator
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Simulate club intervention policies before the semester drop-off window closes.
            </p>
          </div>
          <Badge variant="brand">Predictive Modeling</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {/* Controls Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>Additional Hands-On Workshops:</span>
                <span style={{ color: 'var(--brand-500)', fontFamily: 'var(--font-mono)' }}>+{extraWorkshops} sessions</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={extraWorkshops}
                onChange={(e) => setExtraWorkshops(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-500)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                <span>0 extra</span>
                <span>+3 sessions</span>
                <span>+6 sessions</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>XP Reward Points Multiplier:</span>
                <span style={{ color: 'var(--info)', fontFamily: 'var(--font-mono)' }}>{rewardMultiplier}x Points</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.5"
                value={rewardMultiplier}
                onChange={(e) => setRewardMultiplier(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--info)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                <span>1.0x (Standard)</span>
                <span>2.0x Boost</span>
                <span>3.0x Maximum</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>Target Club Attendance Benchmark:</span>
                <span style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{targetGoal}% Goal</span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                step="5"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--success)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                <span>65% Min</span>
                <span>80% Good</span>
                <span>95% Elite</span>
              </div>
            </div>
          </div>

          {/* Dynamic Projection Results Panel */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Simulation Forecast Output
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                  {projectedAttendance}%
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
                  (+{projectedBoost}% boost)
                </span>
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Baseline: {avgAttendance}% &bull; Projected from current telemetry
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                  {projectedRescued} of {highRisk.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  At-risk students rescued from dropout
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
                  {projectedAttendance >= targetGoal ? 'MET' : 'SHORT'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Goal status vs {targetGoal}% target
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Risk Distribution Gauge & Explainable Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Risk Distribution Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Roster Risk Breakdown</h3>
            <p style={{ fontSize: '0.825rem', margin: '0.2rem 0 0 0' }}>
              Distribution of club members categorized by attendance threshold
            </p>
          </div>

          <RiskScoreGauge
            lowCount={lowRisk.length}
            mediumCount={medRisk.length}
            highCount={highRisk.length}
          />

          <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
              Explainable Scoring Model Weights:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.785rem', color: 'var(--text-dim)' }}>
              <div>&bull; <strong>Missed 3+ consecutive sessions:</strong> +35% risk multiplier</div>
              <div>&bull; <strong>Overall attendance below 65%:</strong> +40% risk multiplier</div>
              <div>&bull; <strong>Zero RSVP response in 21 days:</strong> +25% disengagement signal</div>
            </div>
          </div>
        </div>

        {/* Explainable At-Risk Student Action Cards */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>High-Priority Students</h3>
              <p style={{ fontSize: '0.825rem', margin: '0.2rem 0 0 0' }}>
                Students triggering automated retention interventions
              </p>
            </div>
            <span className="badge badge-danger">{highRisk.length} Flagged</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', maxHeight: '420px' }}>
            {highRisk.map((student) => (
              <div
                key={student.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={student.avatar}
                      alt={student.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.865rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {student.studentId} &bull; {student.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                      {student.attendanceRate}%
                    </span>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {student.attendedEvents}/{student.totalEvents} attended
                    </div>
                  </div>
                </div>

                {/* Specific Risk Factor Reasons */}
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <strong>Trigger reasons:</strong>
                  {student.riskFactors.map((rf, idx) => (
                    <div key={idx} style={{ marginTop: '0.2rem', color: '#fca5a5' }}>
                      &bull; {rf}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
