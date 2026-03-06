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
    'family medicine',
    'family doctor',
    'Dr. Urooj Shibli',
    'Shibli Family Medicine',
    'Mesquite TX doctor',
    'Dallas area physician',
    'obesity medicine',
    'weight loss doctor',
    'primary care',
    'telehealth',
    'board certified physician',
    'ABFM',
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
    description:
      'Board-certified family physician providing compassionate, patient-centered healthcare for over 15 years in Mesquite, TX. Accepting new patients.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dr. Urooj Shibli — Shibli Family Medicine & Obesity Clinic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Urooj Shibli, MD | Family Medicine Mesquite TX',
    description:
      'Compassionate, board-certified family medicine in Mesquite, TX. Book your appointment online.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        {/* Preconnect to external image CDNs used in the app */}
        <link rel="preconnect" href="https://dims.healthgrades.com" />
        <link rel="preconnect" href="https://ucmscdn.healthgrades.com" />
        <link rel="preconnect" href="https://www.openstreetmap.org" />

        {/* Preload above-the-fold local images */}
        <link rel="preload" as="image" href="/team-photo.png" />
        <link rel="preload" as="image" href="/doctor-patient.jpeg" />

        {/* Structured data — Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalClinic',
              name: 'Shibli Family Medicine & Obesity Clinic',
              url: 'https://shiblimed.com',
              telephone: '(469) 827-7300',
              email: 'info@shiblimed.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '802 US Highway 80 E',
                addressLocality: 'Mesquite',
                addressRegion: 'TX',
                postalCode: '75149',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 32.7676,
                longitude: -96.5992,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '09:00',
                  closes: '17:00',
                },
              ],
              medicalSpecialty: ['Family Medicine', 'Obesity Medicine'],
              physician: {
                '@type': 'Physician',
                name: 'Dr. Urooj Shibli',
                honorificPrefix: 'Dr.',
                honorificSuffix: 'MD, ABFM',
                medicalSpecialty: ['Family Medicine', 'Obesity Medicine'],
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '500',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Skip to main content — accessibility */}
          <a
            href="#hero"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg"
          >
            Skip to main content
          </a>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}