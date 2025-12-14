import './globals.css'

export const metadata = {
  title: 'Kalā Sangam',
  description: 'Artist marketplace and growth platform'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  )
}
