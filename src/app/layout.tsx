import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Controle de Financas Familiar',
  description: 'Controle financeiro familiar simples, colaborativo e inteligente',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
