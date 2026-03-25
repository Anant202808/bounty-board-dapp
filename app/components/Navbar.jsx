import { Link, useLocation } from '@remix-run/react';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
  const { account, connecting, connectWallet, disconnectWallet, isCorrectChain, switchToFuji } = useWallet();
  const location = useLocation();

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          BountyBoard
        </Link>

        <ul className="navbar-links">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/bounties" className={isActive('/bounties')}>Bounties</Link></li>
          <li><Link to="/post" className={isActive('/post')}>Post Bounty</Link></li>
          <li><Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link></li>
          <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
        </ul>

        {account ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isCorrectChain && (
              <button className="btn btn-sm" onClick={switchToFuji}
                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Switch to Fuji
              </button>
            )}
            <button className="wallet-btn connected" onClick={disconnectWallet}>
              <span className="dot" />
              {truncate(account)}
            </button>
          </div>
        ) : (
          <button className="wallet-btn" onClick={connectWallet} disabled={connecting}>
            {connecting ? <span className="spinner" /> : '🔷'}
            {connecting ? 'Connecting...' : 'Connect Core Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
