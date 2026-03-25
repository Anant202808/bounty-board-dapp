import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contractConfig';

export function useContract() {
  const { signer, provider } = useWallet();
  const [loading, setLoading] = useState(false);

  // 🔥 STRICT contract getter (no silent fallback)
  const getContract = useCallback((withSigner = false) => {
    if (!provider) throw new Error("Provider not found");

    if (withSigner) {
      if (!signer) throw new Error("Wallet not connected");
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [provider, signer]);

  // ✅ GET ALL BOUNTIES
  const getAllBounties = useCallback(async () => {
    const contract = getContract();
    try {
      const bounties = await contract.getAllBounties();

      return bounties.map((b) => ({
        id: Number(b.id),
        poster: b.poster,
        claimer: b.claimer,
        title: b.title,
        description: b.description,
        reward: ethers.formatEther(b.reward),
        status: Number(b.status),
        createdAt: Number(b.createdAt),
      }));

    } catch (err) {
      console.error("FETCH ERROR:", err);
      return [];
    }
  }, [getContract]);

  // 🚀 POST BOUNTY (FIXED)
  const postBounty = useCallback(async (title, description, rewardInAvax) => {
    setLoading(true);

    try {
      const contract = getContract(true);

      const value = ethers.parseEther(rewardInAvax.toString().trim());

      const tx = await contract.postBounty(title, description, {
        value,
      });

      console.log("TX SENT:", tx.hash);

      await tx.wait();

      console.log("SUCCESS");

      return tx;

    } catch (err) {
      console.error("POST ERROR:", err);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // ✅ CLAIM
  const claimBounty = useCallback(async (bountyId) => {
    setLoading(true);

    try {
      const contract = getContract(true);
      const tx = await contract.claimBounty(bountyId);
      await tx.wait();
      return tx;

    } catch (err) {
      console.error("CLAIM ERROR:", err);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // ✅ COMPLETE
  const completeBounty = useCallback(async (bountyId) => {
    setLoading(true);

    try {
      const contract = getContract(true);
      const tx = await contract.completeBounty(bountyId);
      await tx.wait();
      return tx;

    } catch (err) {
      console.error("COMPLETE ERROR:", err);
      throw err;

    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // ✅ REPUTATION
  const getReputation = useCallback(async (address) => {
    try {
      const contract = getContract();
      const rep = await contract.getReputation(address);
      return Number(rep);

    } catch {
      return 0;
    }
  }, [getContract]);

  return {
    getAllBounties,
    postBounty,
    claimBounty,
    completeBounty,
    getReputation,
    loading,
  };
}