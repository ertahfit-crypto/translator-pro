import './globals.css'

export const metadata = {
  title: 'Translator Pro',
  description: 'Professional translation application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
