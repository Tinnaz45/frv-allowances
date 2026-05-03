import '../src/styles/global.css'

export const metadata = {
    title: 'Fire Allowance Tracker',
    description: 'Track fire allowance claims',
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({ children }) {
    return (
          <html lang="en">
            <body>{children}</body>
      </html>
    )
}
