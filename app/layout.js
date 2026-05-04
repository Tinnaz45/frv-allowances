import './globals.css'

export const metadata = {
  title: 'Fire Allowance Tracker',
  description: 'Track recall, retain, standby, and meal claims.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
