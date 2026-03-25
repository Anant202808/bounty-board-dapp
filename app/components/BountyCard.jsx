import { useWallet } from '../context/WalletContext';

const STATUS_MAP = ['Open', 'Claimed', 'Completed'];
const STATUS_CLASS = ['open', 'claimed', 'completed'];

export default function BountyCard({ bounty, onClaim, onComplete, loading }) {
  const { account } = useWallet();

  const isPoster = account && bounty.poster.toLowerCase() === account.toLowerCase();
  const isClaimer = account && bounty.claimer.toLowerCase() === account.toLowerCase();

  const truncate = (addr) =>
    addr === '0x0000000000000000000000000000000000000000'
      ? 'None'
      : `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bounty-card glass">
      <div className="bounty-card-header">
        <h3>{bounty.title}</h3>
        <span className={`bounty-status ${STATUS_CLASS[bounty.status]}`}>
          {STATUS_MAP[bounty.status]}
        </span>
      </div>

      <p className="bounty-desc">{bounty.description}</p>

      <div className="bounty-meta">
        <span className="bounty-reward">
          ◆ {bounty.reward} AVAX
        </span>
        <span className="bounty-poster" title={bounty.poster}>
          by {truncate(bounty.poster)}
        </span>
      </div>

      {bounty.status === 1 && (
        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Claimed by: <span style={{ color: 'var(--accent-orange)' }}>{truncate(bounty.claimer)}</span>
        </div>
      )}

      {bounty.createdAt > 0 && (
        <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {timeAgo(bounty.createdAt)}
        </div>
      )}

      <div className="bounty-actions">
        {bounty.status === 0 && account && !isPoster && (
          <button className="btn btn-cyan btn-sm" onClick={() => onClaim(bounty.id)} disabled={loading}>
            {loading ? <span className="spinner" /> : '🎯'} Claim
          </button>
        )}
        {bounty.status === 1 && isPoster && (
          <button className="btn btn-green btn-sm" onClick={() => onComplete(bounty.id)} disabled={loading}>
            {loading ? <span className="spinner" /> : '✅'} Complete & Pay
          </button>
        )}
        {bounty.status === 0 && isPoster && (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '7px 0' }}>
            Your bounty — awaiting hunters
          </span>
        )}
        {bounty.status === 2 && (
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', padding: '7px 0' }}>
            ✓ Completed & paid out
          </span>
        )}
      </div>
    </div>
  );
}
