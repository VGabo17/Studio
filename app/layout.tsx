import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Synthetix Studio | Desarrollo Gamer, Plugins Minecraft & Bots Discord',
  description: 'Estudio de desarrollo de alto nivel para plugins de Minecraft (Paper/Purpur/Spigot), setups de servidores y bots de Discord, con portal de clientes y sistema de entregas autónomo.',
  openGraph: {
    title: 'Synthetix Studio | Desarrollo Gamer, Plugins Minecraft & Bots Discord',
    description: 'Estudio de desarrollo de alto nivel para plugins de Minecraft, setups de servidores y bots de Discord, con portal de clientes y sistema de entregas autónomo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synthetix Studio | Desarrollo Gamer, Plugins Minecraft & Bots Discord',
    description: 'Estudio de desarrollo de alto nivel para plugins de Minecraft, setups de servidores y bots de Discord, con portal de clientes y sistema de entregas autónomo.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-[#08050E] text-[#F3E8FF] antialiased selection:bg-[#C084FC]/30 selection:text-white min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
