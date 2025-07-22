import { NextRequest, NextResponse } from 'next/server'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log webhook data for debugging
    console.log('Webhook received:', body)
    
    // Handle different webhook events
    switch (body.type) {
      case 'frame_added':
        console.log('Frame added:', body.data)
        break
      case 'frame_removed':
        console.log('Frame removed:', body.data)
        break
      default:
        console.log('Unknown webhook type:', body.type)
    }
    
    return NextResponse.json(
      { success: true, message: 'Webhook processed successfully' },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
}
