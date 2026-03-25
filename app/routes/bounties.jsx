import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../components/Toast';
import BountyCard from '../components/BountyCard';

export default function Bounties() {
  const { getAllBounties, claimBounty, completeBounty, loading } = useContract();
  const { account } = useWallet();
  const { addToast } = useToast();
  const [bounties, setBounties] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadBounties();
  }, []);

  const loadBounties = async () => {
    setFetching(true);
    const data = await getAllBounties();
    setBounties(data);
    setFetching(false);
  };

  const handleClaim = async (id) => {
    try {
      await claimBounty(id);
      addToast('Bounty claimed successfully!', 'success');
      loadBounties();
    } catch (err) {
      addToast(err.reason || 'Failed to claim bounty', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeBounty(id);
      addToast('Bounty completed! Funds released.', 'success');
      loadBounties();
    } catch (err) {
      addToast(err.reason || 'Failed to complete bounty', 'error');
    }
  };

  const filtered = bounties
    .filter((b) => {
      if (filter === 'open') return b.status === 0;
      if (filter === 'claimed') return b.status === 1;
      if (filter === 'completed') return b.status === 2;
      return true;
    })
    .filter((b) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏴‍☠️ Bounty Board</h1>
        <p>Browse, claim, and complete bounties to earn AVAX</p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search bounties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {['all', 'open', 'claimed', 'completed'].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {fetching ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px' }} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="bounties-grid">
          {filtered.map((b) => (
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
          <div className="empty-icon">📭</div>
          <h3>No bounties found</h3>
          <p>{search ? 'Try a different search term' : 'No bounties match this filter'}</p>
        </div>
      )}
    </div>
  );
}
