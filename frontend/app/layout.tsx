import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skin Insight Engine',
  description: 'Acompanhe os melhores preços de skins de CS2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-neutral-950 text-neutral-50`}>
        {children}
      </body>
    </html>
  );
}