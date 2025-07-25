import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { WalletProvider } from "@/contexts/wallet-context"
import "./globals.css"
import "../styles/miniapp.css"
import { NetworkStatus } from "@/components/network-status"
import { MiniAppProvider } from "@/components/miniapp-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DoeAgora - Doações Descentralizadas",
  description: "Plataforma descentralizada para ONGs criarem perfis, campanhas e receberem doações em cBRL na Base",
  generator: 'v0.dev',
  manifest: '/miniapp-manifest.json',
  themeColor: '#0052FF',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DoeAgora'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DoeAgora" />
        <link rel="manifest" href="/miniapp-manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <MiniAppProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </MiniAppProvider>
      </body>
    </html>
  )
}
