import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google" // Menggunakan Inter sebagai font default yang kompatibel

import "./globals.css" // Pastikan ini ada dan benar

const inter = Inter({ subsets: ["latin"] }) // Inisialisasi font Inter

export const metadata: Metadata = {
  title: "Succinct Drawing",
  description: "A digital graffiti wall for creative challenges.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Menerapkan kelas font Inter ke body */}
      <body className={inter.className}>{children}</body>
    </html>
  )
}
