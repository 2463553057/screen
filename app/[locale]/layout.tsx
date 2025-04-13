import "../globals.css";

import { Clarity } from "@/components/Clarity";
import { ClientBackground } from "@/components/ClientBackground";
import { Inter } from "next/font/google";
import { LanguageToggle } from "@/components/LanguageToggle";
import Link from "next/link";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/app/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/toaster";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(props: { params: { locale: string } }): Promise<Metadata> {
  const locale = (await props.params).locale;
  const t = await getTranslations({ locale, namespace: "app" });
  
  return {
    title: t("title"),
    description: t("subtitle"),
    keywords: "screen sharing, webrtc, online screen share, browser screen sharing, free screen sharing"
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { children } = props;
  const locale = (await props.params).locale;
  let messages;
  try {
    messages = (await import(`../../messages/${locale}/index.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientBackground />
            <main className="flex flex-col justify-between min-h-screen">
              <div className="fixed top-4 right-4 flex space-x-2 z-50">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              {children}
              <footer className="py-8 px-4 text-center text-white text-sm bg-gray-900/30 backdrop-blur-sm mt-8">
                Built by{" "}
                <Link href="https://tonghohin.vercel.app" className="underline" target="_blank">
                  Hin
                </Link>
                . The source code is available on{" "}
                <Link href="https://github.com/tonghohin/screen-sharing" className="underline" target="_blank">
                  Github
                </Link>
                .
              </footer>
            </main>
            <Clarity />
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 