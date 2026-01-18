export const metadata = {
  title: 'FinanceX',
  description: 'Controle financeiro pessoal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
