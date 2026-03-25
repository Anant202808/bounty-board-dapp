import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import BountyCard from '../components/BountyCard';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../components/Toast';

export default function Home() {
  const { getAllBounties, claimBounty, completeBounty, loading } = useContract();
  const { account } = useWallet();
  const { addToast } = useToast();
  const [bounties, setBounties] = useState([]);
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

  const featured = bounties.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Hunt Bounties.<br />Earn Crypto.</h1>
          <p>
            A decentralized bounty platform on Avalanche. Post tasks, claim bounties,
            and get paid in AVAX — all on-chain, trustless, and transparent.
          </p>
          <div className="hero-buttons">
            <Link to="/bounties" className="btn btn-primary btn-lg">
              🔍 Browse Bounties
            </Link>
            <Link to="/post" className="btn btn-secondary btn-lg">
              📝 Post a Bounty
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container">
        <div className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-value">{bounties.length}</div>
            <div className="stat-label">Total Bounties</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">{bounties.filter(b => b.status === 0).length}</div>
            <div className="stat-label">Open Bounties</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">
              {bounties.reduce((sum, b) => sum + parseFloat(b.reward), 0).toFixed(2)}
            </div>
            <div className="stat-label">Total AVAX Locked</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-value">{bounties.filter(b => b.status === 2).length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to start earning</p>
          <div className="steps-grid">
            <div className="step-card glass">
              <div className="step-icon">📋</div>
              <h3>Post a Bounty</h3>
              <p>Describe your task, set a reward in AVAX, and lock it in the smart contract.</p>
            </div>
            <div className="step-card glass">
              <div className="step-icon">🎯</div>
              <h3>Claim & Work</h3>
              <p>Hunters browse open bounties, claim tasks, and start working on solutions.</p>
            </div>
            <div className="step-card glass">
              <div className="step-icon">💰</div>
              <h3>Complete & Earn</h3>
              <p>Once approved by the poster, the smart contract releases AVAX to the hunter.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bounties */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Latest Bounties</h2>
            <p className="section-subtitle">Freshly posted opportunities</p>
            <div className="bounties-grid">
              {featured.map((b) => (
                <BountyCard
                  key={b.id}
                  bounty={b}
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                  loading={loading}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/bounties" className="btn btn-secondary">View All Bounties →</Link>
            </div>
          </div>
        </section>
      )}

      {/* No bounties message */}
      {!fetching && bounties.length === 0 && (
        <section className="section">
          <div className="container">
            <div className="empty-state glass" style={{ padding: '60px 20px' }}>
              <div className="empty-icon">🚀</div>
              <h3>No bounties yet!</h3>
              <p>Be the first to post a bounty and kickstart the ecosystem.</p>
              <div style={{ marginTop: '20px' }}>
                <Link to="/post" className="btn btn-primary">Post First Bounty</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
