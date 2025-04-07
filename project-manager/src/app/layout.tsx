// app/layout.tsx
import './globals.css';
import Navigation from '@/app/components/Navigation';
import { SessionProviderWrapper } from '@/app/components/SessionProvider';

export const metadata = {
  title: 'TaskFlow',
  description: 'Project management app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}