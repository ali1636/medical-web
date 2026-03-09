import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: {
    default: 'Dr. Urooj Shibli, MD | Shibli Family Medicine & Obesity Clinic',
    template: '%s | Shibli Family Medicine',
  },
  description:
    'Board-certified family physician providing compassionate, patient-centered healthcare for over 15 years in Mesquite, TX (Dallas Area). Accepting new patients. Book your appointment today.',
  keywords: [
    'family medicine', 'family doctor', 'Dr. Urooj Shibli', 'Shibli Family Medicine',
    'Mesquite TX doctor', 'Dallas area physician', 'obesity medicine',
    'weight loss doctor', 'primary care', 'telehealth', 'board certified physician', 'ABFM',
  ],
  authors: [{ name: 'Dr. Urooj Shibli, MD' }],
  creator: 'Shibli Family Medicine & Obesity Clinic',
  metadataBase: new URL('https://shiblimed.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shiblimed.com',
    siteName: 'Shibli Family Medicine & Obesity Clinic',
    title: 'Dr. Urooj Shibli, MD | Family Medicine & Obesity Specialist',
    description: 'Board-certified family physician in Mesquite, TX. Accepting new patients.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Dr. Urooj Shibli' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Urooj Shibli, MD | Family Medicine Mesquite TX',
    description: 'Compassionate, board-certified family medicine in Mesquite, TX.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://dims.healthgrades.com" />
        <link rel="preconnect" href="https://ucmscdn.healthgrades.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalClinic',
              name: 'Shibli Family Medicine & Obesity Clinic',
              url: 'https://shiblimed.com',
              telephone: '(469) 827-7300',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '802 US Highway 80 E',
                addressLocality: 'Mesquite',
                addressRegion: 'TX',
                postalCode: '75149',
                addressCountry: 'US',
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:text-sm focus:font-semibold">
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}