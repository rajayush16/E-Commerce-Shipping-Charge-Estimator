import Link from "next/link";

export function TopNav() {
  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/calculator" className="text-sm font-semibold tracking-tight">
          Shipping Charge Estimator
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/calculator" className="transition-colors hover:text-foreground">
            Calculator
          </Link>
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
          <Link href="/history" className="transition-colors hover:text-foreground">
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
