import React, { useState } from "react"
import { Upload, ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react"
import { ethers } from "ethers"
import { getContract } from "./contract"

function App() {
  const [file, setFile] = useState(null)
  const [hash, setHash] = useState("")
  const [verifyFile, setVerifyFile] = useState(null)
  const [verifyHash, setVerifyHash] = useState("")
  const [verified, setVerified] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  // Helper: Calculate file hash
  const getFileHash = async (file) => {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    return ethers.keccak256(bytes)
  }

  // Upload & hash document
  const handleUpload = async (e) => {
    const uploaded = e.target.files[0]
    setFile(uploaded)
    if (uploaded) {
      const h = await getFileHash(uploaded)
      setHash(h)
    }
  }

  // Re-upload for verification
  const handleVerifyUpload = async (e) => {
    const uploaded = e.target.files[0]
    setVerifyFile(uploaded)
    if (uploaded) {
      const h = await getFileHash(uploaded)
      setVerifyHash(h)
    }
  }

  // Register file hash on blockchain
  const registerOnBlockchain = async () => {
    if (!hash) return alert("Please upload a document first.")
    try {
      setLoading(true)
      setStatus("Registering document on blockchain...")

      const contract = await getContract()
      const tx = await contract.registerDocument(hash)
      await tx.wait()

      setStatus("✅ Document registered successfully!")
    } catch (err) {
      console.error(err)
      setStatus("❌ Error registering document.")
    } finally {
      setLoading(false)
    }
  }

  // Verify document authenticity
  const handleVerification = async () => {
    if (!verifyHash) return alert("Please upload document to verify.")
    try {
      setLoading(true)
      setStatus("Verifying document...")

      const contract = await getContract()
      const [signer, timestamp] = await contract.verifyDocument(verifyHash)
      const time = Number(timestamp)

      if (signer === "0x0000000000000000000000000000000000000000" || !time) {
        setVerified(false)
        setStatus("❌ Document not found or not registered.")
        return
      }

      setVerified(true)
      setStatus(`✅ Document verified! Registered by ${signer} on ${new Date(time * 1000).toLocaleString()}`)
    } catch (err) {
      console.error("Verification failed:", err)
      setVerified(false)
      setStatus("❌ Document not found or not registered.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-4xl font-extrabold text-orange-500 tracking-wide">LegalChain Proof</h1>
        <p className="text-gray-400 mt-1 text-sm">Your trusted file verification system</p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row items-center justify-center gap-6 p-6">
        {/* Upload Section */}
        <div className="flex-1 max-w-lg w-full bg-gray-950/40 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-3">
            <FileText className="text-orange-400" size={45} />
          </div>
          <h2 className="text-2xl font-bold mb-1">Document Upload & Signing</h2>
          <p className="text-gray-400 text-sm mb-5">
            Upload your file and register its proof securely on the BlockDAG blockchain.
          </p>

          <label className="w-full border-2 border-dashed border-orange-400 rounded-xl p-6 cursor-pointer hover:bg-orange-400/10 transition flex flex-col items-center">
            <Upload className="text-orange-400 mb-2" size={30} />
            <span className="text-sm">{file ? file.name : "Click to upload document"}</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>

          {hash && (
            <div className="mt-3 text-xs text-gray-400">
              Document Hash: <span className="text-orange-400 font-mono">{hash.slice(0, 20)}...</span>
            </div>
          )}

          <button
            onClick={registerOnBlockchain}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 transition px-6 py-2 rounded-lg mt-5 font-semibold w-full disabled:opacity-50"
          >
            {loading ? "Processing..." : "Register on Blockchain"}
          </button>
        </div>

        {/* Verification Section */}
        <div className="flex-1 max-w-lg w-full bg-gray-950/40 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-3">
            <ShieldCheck className="text-green-400" size={45} />
          </div>
          <h2 className="text-2xl font-bold mb-1">Document Verification</h2>
          <p className="text-gray-400 text-sm mb-5">
            Upload a file to confirm its authenticity and verify its on-chain proof.
          </p>

          <label className="w-full border-2 border-dashed border-green-400 rounded-xl p-6 cursor-pointer hover:bg-green-400/10 transition flex flex-col items-center">
            <Upload className="text-green-400 mb-2" size={30} />
            <span className="text-sm">{verifyFile ? verifyFile.name : "Upload document to verify"}</span>
            <input type="file" className="hidden" onChange={handleVerifyUpload} />
          </label>

          {verifyHash && (
            <div className="mt-3 text-xs text-gray-400">
              File Hash: <span className="text-green-400 font-mono">{verifyHash.slice(0, 20)}...</span>
            </div>
          )}

          <button
            onClick={handleVerification}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 transition px-6 py-2 rounded-lg mt-5 font-semibold w-full disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Document"}
          </button>

          {verified !== null && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {verified ? (
                <>
                  <CheckCircle2 className="text-green-400" size={22} />
                  <span className="text-green-400 text-sm">Verified — Document is authentic!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400" size={22} />
                  <span className="text-red-400 text-sm">Verification failed — document mismatch.</span>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Status */}
      {status && <p className="text-center text-sm text-gray-300 mb-4">{status}</p>}

      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-800 text-gray-500 text-xs">
        © Daggers of Fortune 2025 | BlockDAG Hackathon
      </footer>
    </div>
  )
}

export default App
