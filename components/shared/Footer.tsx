export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="px-6 py-4">
        <div className="hidden sm:flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2026 TempEd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Support:</span>
            <a
              href="mailto:support@temped.co.za"
              className="text-primary hover:text-primary/90 font-bold"
            >
              support@temped.co.za
            </a>
          </div>
        </div>
        <div className="flex sm:hidden flex-col items-center gap-1 text-sm text-muted-foreground">
          <p>&copy; 2026 TempEd. All rights reserved.</p>
          <a
            href="mailto:support@temped.co.za"
            className="text-primary hover:text-primary/90 font-bold"
          >
            support@temped.co.za
          </a>
        </div>
      </div>
    </footer>
  );
}
