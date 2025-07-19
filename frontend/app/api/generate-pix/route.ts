import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, correlationID, comment } = await request.json()

    // Simulate OpenPix API integration
    const pixData = {
      correlationID,
      value: amount,
      comment,
      qrCodeImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      brCode: `00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540${amount.toString().padStart(10, "0")}5802BR5925INSTITUTO CRIANCA FELIZ6009SAO PAULO62070503***6304`,
      pixKey: "123e4567-e89b-12d3-a456-426614174000",
    }

    return NextResponse.json({
      success: true,
      data: pixData,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate PIX code" }, { status: 500 })
  }
}
