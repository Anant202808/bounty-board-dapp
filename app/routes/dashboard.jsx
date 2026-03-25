import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../components/Toast';
import BountyCard from '../components/BountyCard';
import { getRepTier } from './leaderboard';

export default function Dashboard() {
  const { getAllBounties, claimBounty, completeBounty, getReputation, loading } = useContract();
  const { account, connectWallet } = useWallet();
  const { addToast } = useToast();
  const [bounties, setBounties] = useState([]);
  const [reputation, setReputation] = useState(0);
  const [tab, setTab] = useState('posted');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (account) {
      loadData();
    }
  }, [account]);

  const loadData = async () => {
    setFetching(true);
    const [data, rep] = await Promise.all([
      getAllBounties(),
      getReputation(account),
    ]);
    setBounties(data);
    setReputation(rep);
    setFetching(false);
  };

  const handleClaim = async (id) => {
    try {
      await claimBounty(id);
      addToast('Bounty claimed!', 'success');
      loadData();
    } catch (err) {
      addToast(err.reason || 'Failed to claim', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeBounty(id);
      addToast('Bounty completed! Funds released.', 'success');
      loadData();
    } catch (err) {
      addToast(err.reason || 'Failed to complete', 'error');
    }
  };

  if (!account) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>👤 Dashboard</h1>
          <p>Connect your wallet to view your profile</p>
        </div>
        <div className="empty-state glass" style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="empty-icon">🔷</div>
          <h3>Wallet Required</h3>
          <p>Connect your Core Wallet to see your bounties and reputation</p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  const myPosted = bounties.filter(b => b.poster.toLowerCase() === account.toLowerCase());
  const myClaimed = bounties.filter(b => b.claimer.toLowerCase() === account.toLowerCase());
  const displayed = tab === 'posted' ? myPosted : myClaimed;

  const totalEarned = myClaimed
    .filter(b => b.status === 2)
    .reduce((sum, b) => sum + parseFloat(b.reward), 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>👤 Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        <div className="profile-card glass">
          <div className="profile-avatar">🧑‍💻</div>
          <div className="profile-address">{account}</div>
          {(() => {
            const tier = getRepTier(reputation);
            return (
              <div className="tier-badge-large" style={{ color: tier.color, background: tier.glow, border: `1px solid ${tier.color}40` }}>
                {tier.emoji} {tier.label}
              </div>
            );
          })()}
          <div className="profile-stat">
            <span>Reputation:</span>
            <span>⭐ {reputation}</span>
          </div>
          <div className="profile-stat">
            <span>Earned:</span>
            <span>◆ {totalEarned.toFixed(3)} AVAX</span>
          </div>
          <div className="profile-stat">
            <span>Posted:</span>
            <span>{myPosted.length}</span>
          </div>
          <div className="profile-stat">
            <span>Claimed:</span>
            <span>{myClaimed.length}</span>
          </div>
        </div>

        <div>
          <div className="dashboard-tabs">
            <button
              className={`dashboard-tab ${tab === 'posted' ? 'active' : ''}`}
              onClick={() => setTab('posted')}
            >
              My Posted ({myPosted.length})
            </button>
            <button
              className={`dashboard-tab ${tab === 'claimed' ? 'active' : ''}`}
              onClick={() => setTab('claimed')}
            >
              My Claimed ({myClaimed.length})
            </button>
          </div>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '32px', height: '32px' }} />
            </div>
          ) : displayed.length > 0 ? (
            <div className="bounties-grid" style={{ gridTemplateColumns: '1fr' }}>
              {displayed.map((b) => (
                <BountyCard
                  key={b.id}
                  bounty={b}
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">{tab === 'posted' ? '📋' : '🎯'}</div>
              <h3>No {tab} bounties</h3>
              <p>{tab === 'posted' ? "You haven't posted any bounties yet" : "You haven't claimed any bounties yet"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
