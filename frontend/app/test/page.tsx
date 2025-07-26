"use client"

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(`[TEST] ${message}`)
  }

  useEffect(() => {
    try {
      addLog('✅ Test page loaded successfully')
      addLog(`📱 User Agent: ${navigator.userAgent}`)
      addLog(`🌐 URL: ${window.location.href}`)
      addLog(`🔍 Is SuperApp: ${navigator.userAgent.includes('Coinbase')}`)
      setStatus('✅ Working - No errors detected')
    } catch (error) {
      addLog(`❌ Error in useEffect: ${error}`)
      setStatus('❌ Error detected')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">🧪 Test Page</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <p className="text-sm bg-gray-100 p-2 rounded">{status}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Environment:</h2>
          <div className="text-sm space-y-1">
            <p>🌐 <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
            <p>📱 <strong>SuperApp:</strong> {typeof navigator !== 'undefined' && navigator.userAgent.includes('Coinbase') ? 'YES' : 'NO'}</p>
            <p>⏰ <strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Logs:</h2>
          <div className="bg-black text-green-400 rounded p-3 text-xs font-mono max-h-32 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              addLog('🔄 Manual test button clicked')
              setStatus('✅ Manual test successful')
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            🧪 Run Test
          </button>
        </div>
      </div>
    </div>
  )
}
