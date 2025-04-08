import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { UserProvider } from "./context/user-context"

export const metadata: Metadata = {
  title: "Echo",
  description: "Where you draw inspiration from the unseen threads of human connections",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}