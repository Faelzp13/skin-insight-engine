import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from './components/ThemeProvider';
import Navbar from './components/Navbar';

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
    // Adicionamos suppressHydrationWarning para o next-themes funcionar perfeitamente com a tag html
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 min-h-screen transition-colors`}>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}