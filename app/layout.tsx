import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Ubuntu_Sans, Ubuntu_Sans_Mono } from "next/font/google";
import "./globals.css";

const ubuntuSans = Ubuntu_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ubuntuSansMono = Ubuntu_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Am I Cracked?",
  generator: "Next.js",
  applicationName: "Am I Cracked?",
  alternates: {
    canonical: "https://amicracked.com",
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": 120,
  },
  description: "Ever wonder if you're the mystique 10x engineer? Let's find out together.",
  openGraph: {
    title: "Am I Cracked?",
    description: "Ever wonder if you're the mystique 10x engineer? Let's find out together.",
    images: [{ url: "https://amicracked.com/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
    url: "https://amicracked.com",
    siteName: "amicracked.com",
    locale: "en_US",
    countryName: "United States",
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Cracked?",
    description: "Ever wonder if you're the mystique 10x engineer? Let's find out today.",
    creator: "@notnyuma",
    images: ["https://amicracked.com/opengraph-image.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ubuntuSans.variable} ${ubuntuSansMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
