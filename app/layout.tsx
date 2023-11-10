import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import classNames from "classnames";

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
      <body className={classNames(inter.className)}>{children}</body>
    </html>
  )
}
