import { ethers } from "ethers"

const CONTRACT_ADDRESS = "0x119abdc42d0094c79f72e18e66ce8b52a6f931ef" // My Smart Contract Addrees
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "registerDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "verifyDocument",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "signer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DocumentRegistered",
    "type": "event"
  }
]

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found")

  await window.ethereum.request({ method: "eth_requestAccounts" })
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  return contract
}
