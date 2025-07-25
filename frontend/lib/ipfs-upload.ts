/**
 * IPFS Upload Service using Pinata API
 * Handles uploading images to IPFS for DoeAgora MVP
 */

// Pinata API configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ''
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || ''

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

class IPFSUploadService {
  private readonly PINATA_API_URL = 'https://api.pinata.cloud'
  
  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, name?: string): Promise<string> {
    try {
      console.log('📸 Uploading file to IPFS:', file.name)
      
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const metadata = JSON.stringify({
        name: name || file.name,
        keyvalues: {
          app: 'doeagora',
          type: 'image',
          timestamp: Date.now().toString()
        }
      })
      formData.append('pinataMetadata', metadata)
      
      // Add options
      const options = JSON.stringify({
        cidVersion: 0,
      })
      formData.append('pinataOptions', options)
      
      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pinata API error: ${response.status} - ${errorText}`)
      }
      
      const result: PinataResponse = await response.json()
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      
      console.log('✅ File uploaded to IPFS:', ipfsUrl)
      return ipfsUrl
      
    } catch (error) {
      console.error('❌ Error uploading to IPFS:', error)
      throw error
    }
  }
  
  /**
   * Upload base64 image to IPFS
   */
  async uploadBase64(base64Data: string, filename: string): Promise<string> {
    try {
      console.log('📸 Converting base64 to file for IPFS upload')
      
      // Convert base64 to blob
      const response = await fetch(base64Data)
      const blob = await response.blob()
      
      // Create file from blob
      const file = new File([blob], filename, { type: blob.type })
      
      return await this.uploadFile(file, filename)
      
    } catch (error) {
      console.error('❌ Error uploading base64 to IPFS:', error)
      throw error
    }
  }
  
  /**
   * Test IPFS connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ IPFS connection test successful:', result)
        return true
      } else {
        console.error('❌ IPFS connection test failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ IPFS connection test error:', error)
      return false
    }
  }
  
  /**
   * Get IPFS URL from hash
   */
  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
  
  /**
   * Extract hash from IPFS URL
   */
  extractHashFromUrl(url: string): string | null {
    const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }
}

export const ipfsUpload = new IPFSUploadService()

// Helper function to handle file uploads with error handling
export async function uploadImageToIPFS(file: File, name?: string): Promise<string> {
  try {
    if (!PINATA_JWT && !PINATA_API_KEY) {
      console.warn('⚠️ IPFS credentials not configured, using fallback')
      // For MVP, fallback to base64 if IPFS not configured
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      })
    }
    
    return await ipfsUpload.uploadFile(file, name)
  } catch (error) {
    console.error('❌ IPFS upload failed, using base64 fallback:', error)
    
    // Fallback to base64 if IPFS fails
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        resolve(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
}

// Helper function for base64 uploads
export async function uploadBase64ToIPFS(base64Data: string, filename: string): Promise<string> {
  try {
    if (!PINATA_JWT && !PINATA_API_KEY) {
      console.warn('⚠️ IPFS credentials not configured, returning base64')
      return base64Data
    }
    
    return await ipfsUpload.uploadBase64(base64Data, filename)
  } catch (error) {
    console.error('❌ IPFS upload failed, returning base64:', error)
    return base64Data
  }
}
