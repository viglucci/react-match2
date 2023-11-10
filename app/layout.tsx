import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import classNames from "classnames";
import { Analytics } from '@vercel/analytics/react';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'React Match2',
  description: 'Fun match2 puzzle game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={classNames(inter.className)}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
