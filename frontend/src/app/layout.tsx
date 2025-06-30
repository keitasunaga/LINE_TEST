import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/app/contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DID ウォレット - Verifiable Credentials管理',
  description: 'デジタル証明書を安全に管理するLINEミニアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <UserProvider>
          {children}
          <Toaster position="top-center" />
        </UserProvider>
      </body>
    </html>
  );
}