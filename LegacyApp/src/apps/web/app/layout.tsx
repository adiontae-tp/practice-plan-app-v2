import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { MWAppShell } from '@/components/tp';
import { AppProvider, AuthProvider } from '@/components/providers';
import { MWProvider, MWToastProvider } from '@ppa/mobile-web';
import { OnboardingProvider } from '@/components/tp/onboarding';

const GTM_ID = 'GTM-K33VDMF6';
const GA_ADS_ID = 'AW-17781958423';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Practice Plan App',
  description: 'Plan and manage your practice sessions',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Practice Plan',
  },
};

export const viewport: Viewport = {
  themeColor: '#356793',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        {/* Google Ads (gtag.js) */}
        <Script
          id="gtag-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
        />
        <Script
          id="gtag-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ADS_ID}');
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <MWProvider>
          <MWToastProvider position="top">
            <AuthProvider>
              <MWAppShell>
                <AppProvider>
                  <OnboardingProvider>
                    {children}
                  </OnboardingProvider>
                </AppProvider>
              </MWAppShell>
            </AuthProvider>
          </MWToastProvider>
        </MWProvider>
      </body>
    </html>
  );
}
