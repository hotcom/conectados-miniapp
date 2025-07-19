import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NetworkStatus } from "@/components/network-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DoaçãoSocial - Rede Social de Doações",
  description: "Plataforma descentralizada para doações e causas sociais",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="fixed top-16 left-0 right-0 z-40 px-4">
          <div className="max-w-6xl mx-auto">
            <NetworkStatus />
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
