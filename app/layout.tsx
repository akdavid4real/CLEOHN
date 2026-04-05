import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'CLEOHN - Nigerian CAC Registration Agency',
  description: 'Trusted Nigerian CAC Registration Agency for Business Name, Company (LLC), NGO/Trustees, TIN, SCUML, and Trademark registration services.',
  generator: 'Ak David',
  icons: {
    icon: '/logoicon.png',
    apple: '/logoicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <FloatingWhatsApp />
        <Analytics />
      </body>
    </html>
  )
}
