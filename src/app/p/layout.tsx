/**
 * Layout for public portfolio pages
 * Minimal wrapper - portfolios render their own complete styling
 */
export default function PublicPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
