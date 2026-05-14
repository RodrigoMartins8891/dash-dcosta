import "./globals.css";

export const metadata = {
  title: "OrdenhaPeças — Gestão de Estoque e Vendas",
  description: "Sistema de gestão de estoque e vendas para peças de ordenhadeiras",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
