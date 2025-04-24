import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from "@/src/i18n/routing";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "@/src/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = await params;
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'metadata' });
    return {
        title: t('title')
    };
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale;
    
    // Validate the locale
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Get messages for the current locale
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
        <body className={inter.className}>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <Toaster />
                    {children}
                </ThemeProvider>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}