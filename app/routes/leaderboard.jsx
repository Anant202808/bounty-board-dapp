import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';

export function getRepTier(rep) {
  if (rep >= 10) return { label: 'Elite', emoji: '👑', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', min: 10 };
  if (rep >= 5)  return { label: 'Silver', emoji: '🥈', color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', min: 5 };
  if (rep >= 1)  return { label: 'Bronze', emoji: '🥉', color: '#cd7c3a', glow: 'rgba(205,124,58,0.3)', min: 1 };
  return           { label: 'Rookie', emoji: '🌱', color: '#6b7280', glow: 'rgba(107,114,128,0.2)', min: 0 };
}

export default function Leaderboard() {
  const { getAllBounties, getReputation } = useContract();
  const { account } = useWallet();
  const [leaders, setLeaders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setFetching(true);
    try {
      const bounties = await getAllBounties();

      const addressSet = new Set();
      bounties.forEach(b => {
        if (b.poster) addressSet.add(b.poster.toLowerCase());
        if (b.claimer && b.claimer !== '0x0000000000000000000000000000000000000000') {
          addressSet.add(b.claimer.toLowerCase());
        }
      });

      const repResults = await Promise.all(
        [...addressSet].map(async (addr) => {
          const rep = await getReputation(addr);
          const completed = bounties.filter(
            b => b.claimer?.toLowerCase() === addr && b.status === 2
          ).length;
          const earned = bounties
            .filter(b => b.claimer?.toLowerCase() === addr && b.status === 2)
            .reduce((sum, b) => sum + parseFloat(b.reward), 0);
          return { address: addr, reputation: rep, completed, earned };
        })
      );

      const sorted = repResults
        .filter(r => r.reputation > 0 || r.completed > 0)
        .sort((a, b) => b.reputation - a.reputation || b.completed - a.completed);

      setLeaders(sorted);
    } catch (err) {
      console.error('Leaderboard load failed:', err);
    } finally {
      setFetching(false);
    }
  };

  const truncate = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isMe = (addr) => account && addr.toLowerCase() === account.toLowerCase();

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top bounty hunters ranked by reputation</p>
      </div>

      <div className="tier-legend glass">
        {[
          { label: 'Rookie', emoji: '🌱', desc: '0 completions', color: '#6b7280' },
          { label: 'Bronze', emoji: '🥉', desc: '1+ completions', color: '#cd7c3a' },
          { label: 'Silver', emoji: '🥈', desc: '5+ completions', color: '#94a3b8' },
          { label: 'Elite',  emoji: '👑', desc: '10+ completions', color: '#f59e0b' },
        ].map(tier => (
          <div key={tier.label} className="tier-item">
            <span className="tier-emoji">{tier.emoji}</span>
            <span className="tier-name" style={{ color: tier.color }}>{tier.label}</span>
            <span className="tier-desc">{tier.desc}</span>
          </div>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px' }} />
        </div>
      ) : leaders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏜️</div>
          <h3>No hunters yet</h3>
          <p>Complete bounties to appear on the leaderboard</p>
        </div>
      ) : (
        <div className="leaderboard-table glass">
          <div className="lb-header">
            <span className="lb-rank">Rank</span>
            <span className="lb-hunter">Hunter</span>
            <span className="lb-tier">Tier</span>
            <span className="lb-rep">Rep</span>
            <span className="lb-completed">Done</span>
            <span className="lb-earned">Earned</span>
          </div>

          {leaders.map((user, idx) => {
            const tier = getRepTier(user.reputation);
            const rank = idx + 1;
            const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

            return (
              <div
                key={user.address}
                className={`lb-row ${isMe(user.address) ? 'lb-row-me' : ''}`}
                style={isMe(user.address) ? { border: `1px solid ${tier.color}`, boxShadow: `0 0 12px ${tier.glow}` } : {}}
              >
                <span className="lb-rank">
                  <span className="rank-display">{rankDisplay}</span>
                </span>
                <span className="lb-hunter">
                  <span className="hunter-addr" title={user.address}>
                    {truncate(user.address)}
                  </span>
                  {isMe(user.address) && <span className="me-badge">You</span>}
                </span>
                <span className="lb-tier">
                  <span className="tier-badge" style={{ color: tier.color, background: tier.glow }}>
                    {tier.emoji} {tier.label}
                  </span>
                </span>
                <span className="lb-rep">
                  <span style={{ color: '#f0f0f5', fontWeight: 600 }}>⭐ {user.reputation}</span>
                </span>
                <span className="lb-completed">{user.completed}</span>
                <span className="lb-earned" style={{ color: 'var(--accent-cyan)' }}>
                  ◆ {user.earned.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
