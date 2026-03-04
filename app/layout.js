import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Dr. , MD |  Family Medicine & Obesity Clinic',
  description: 'Board-certified family physician providing compassionate, patient-centered healthcare for over 15 years in Mesquite, TX. Book your appointment today.',
  keywords: 'family medicine, doctor, Mesquite TX, Dallas, family physician, obesity clinic, Dr.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}