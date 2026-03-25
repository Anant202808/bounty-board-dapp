# BountyBoard — Deploy & Run Instructions

---

## BEFORE ANYTHING — Get Test AVAX

You need free test AVAX to pay for deployment.

1. Go to: https://faucet.avax.network
2. Select "Fuji (C-Chain)"
3. Open Core Wallet → copy your wallet address
4. Paste it in the faucet and click "Request 2 AVAX"
5. Wait 30 seconds — it will arrive in your wallet

---

## STEP 1 — Install Dependencies

Open terminal inside the `bounty_hunter` folder and run:

```bash
npm install
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

---

## STEP 2 — Add Your Private Key

Create a file called `.env` in the root of the project (same folder as `package.json`):

```
PRIVATE_KEY=your_core_wallet_private_key_here
```

### How to get your Core Wallet private key:
1. Open Core Wallet (browser extension)
2. Click the account name at the top
3. Click the three dots (...) next to your account
4. Click "Export Private Key"
5. Enter your password
6. Copy the key and paste it into the `.env` file

⚠️ NEVER share this key with anyone. NEVER commit the .env file to GitHub.

---

## STEP 3 — Deploy the Smart Contract

Run this in terminal:

```bash
npx hardhat run scripts/deploy.js --network fuji
```

You will see output like:

```
Deploying BountyBoard to Avalanche Fuji...
BountyBoard deployed to: 0xABC123def456...
Update src/config/contractConfig.js with this address!
```

Copy that address (0xABC123...).

---

## STEP 4 — Update Contract Address

Open the file:
```
src/config/contractConfig.js
```

Find this line:
```js
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
```

Replace with your deployed address:
```js
export const CONTRACT_ADDRESS = '0xABC123def456...'; // your actual address
```

Save the file.

---

## STEP 5 — Run the Frontend

```bash
npm run dev
```

Open your browser and go to: http://localhost:5173

---

## STEP 6 — Connect Core Wallet

1. Click "Connect Core Wallet" in the navbar
2. Core Wallet will pop up — click Approve
3. It will automatically switch to Fuji testnet
4. If it doesn't switch automatically, the app will show a "Switch to Fuji" button — click it

### Add Fuji manually in Core Wallet (if needed):
- Network Name: Avalanche Fuji C-Chain
- RPC URL: https://api.avax-test.network/ext/bc/C/rpc
- Chain ID: 43113
- Currency Symbol: AVAX
- Explorer: https://testnet.snowtrace.io/

---

## That's It — Your App is Live!

### What you can do:
- Post a bounty → fill title, description, AVAX amount
- Claim a bounty → click "Claim" on any open bounty
- Complete a bounty → poster clicks "Complete & Pay" after work is done
- Leaderboard → see top hunters ranked by reputation
- Dashboard → see your posted and claimed bounties + your tier (Rookie / Bronze / Silver / Elite)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Wrong network" warning | Click "Switch to Fuji" in navbar |
| Transaction fails | Make sure you have test AVAX from faucet |
| Nothing loads | Check CONTRACT_ADDRESS is updated in Step 4 |
| Core Wallet not detected | Make sure the browser extension is installed and unlocked |

