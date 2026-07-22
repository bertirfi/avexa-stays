export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // No Nav / Footer here — auth pages are minimal full-screen flows
  return <>{children}</>;
}
