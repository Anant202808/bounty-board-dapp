import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../components/Toast';

export default function PostBounty() {
  const { postBounty, loading } = useContract();
  const { account, connectWallet } = useWallet();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reward) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    if (parseFloat(reward) <= 0) {
      addToast('Reward must be greater than 0', 'error');
      return;
    }
    try {
      await postBounty(title, description, reward);
      addToast('Bounty posted successfully! 🎉', 'success');
      navigate('/bounties');
    } catch (err) {
      addToast(err.reason || 'Failed to post bounty', 'error');
    }
  };

  if (!account) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>📝 Post a Bounty</h1>
          <p>Connect your wallet to post a bounty</p>
        </div>
        <div className="empty-state glass" style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="empty-icon">🔷</div>
          <h3>Wallet Required</h3>
          <p>You need to connect your Core Wallet to post bounties</p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📝 Post a Bounty</h1>
        <p>Describe your task and lock AVAX as a reward</p>
      </div>

      <form className="form-card glass" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bounty Title</label>
          <input
            type="text"
            placeholder="e.g. Build a DEX frontend"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Describe the task in detail — requirements, deliverables, deadline..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Reward (AVAX)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.5"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <>
              <span className="spinner" /> Posting...
            </>
          ) : (
            '🚀 Post Bounty & Lock AVAX'
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          The AVAX reward will be locked in the smart contract until the bounty is completed.
        </p>
      </form>
    </div>
  );
}
