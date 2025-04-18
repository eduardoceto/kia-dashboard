import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from "@/src/i18n/routing";
import { getMessages, getTranslations } from "next-intl/server";


const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata' });

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
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
        <body className={inter.className}>
            <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}