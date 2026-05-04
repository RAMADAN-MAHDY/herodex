import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import {WhatsAppFloat} from "@/components/home/WhatsAppFloat";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "900"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "900"],
});

// التعديل هنا فقط في الـ Metadata لتحسين الـ SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.herodex-pharma.com'),
  title: "Herodex Pharma | أفضل علاج لتساقط الشعر الشديد وفراغات الشعر",
  description: "اكتشفي مجموعة FortaHair من Herodex Pharma. منتجات طبية 100% لعلاج تساقط الشعر للنساء طبيعي، تكثيف الشعر، وعلاج الفراغات. أفضل منتج لمنع تساقط الشعر في مصر بتركيبة هندية.",
  keywords: [
    "علاج تساقط الشعر", "أفضل علاج لتساقط الشعر الشديد", "Herodex Pharma", "FortaHair", 
    "منتج يمنع تساقط الشعر ويكثفه", "حل نهائي لتساقط الشعر", "علاج الفراغات في الشعر", 
    "سعر علاج تساقط الشعر", "شراء منتج تكثيف الشعر", "منتجات طبية 100%", "كورس علاج تساقط الشعر"
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Herodex",
  },
  icons: {
    icon: "/logo/logo.webp",
    apple: "/logo/logo.webp",
  },
  openGraph: {
    title: "Herodex Pharma | حل نهائي لتساقط الشعر وتكثيفه",
    description: "مجموعة فورتا هير (FortaHair) لعلاج فراغات الشعر وتساقطه. منتجات طبيعية 100% لنتائج سريعة.",
    images: ["/logo/logo.webp"],
  }
};



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#117a5c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable} h-full antialiased`}
      // data-scroll-behavior="smooth"
    >
      <head>
        {/* Meta Pixel Code — only render if pixel ID is configured */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {/* End Meta Pixel Code */}

        {/* TikTok Pixel — only render if pixel ID is configured */}
        {process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
  ttq.page();
}(window, document, 'ttq');
            `}
          </Script>
        )}
        {/* End TikTok Pixel */}

        {/* Google Analytics (gtag.js) — only render if GA ID is configured */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* End Google Analytics */}
      </head>
      <body className="min-h-full flex flex-col font-cairo text-[115%] leading-[1.6]">
        <Suspense fallback={null}>
          <Providers>{children}
            <WhatsAppFloat/>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}