import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-sans" })
const geist = Geist({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: 'Kazoku Calendar - 家族カレンダー',
  description: '家族で共有できるカレンダーアプリ。イベント管理、メンバー色分け、リマインダー通知機能付き。',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${geist.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors toastOptions={{ className: "text-sm" }} />
        <Analytics />
      </body>
    </html>
  )
}
