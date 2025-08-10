import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-muted/40">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/80">
        <div>© {new Date().getFullYear()} Mayukh Bagchi</div>
        <nav className="flex items-center gap-4">
          <Link className="hover:text-accent" href="/blogs">Blog</Link>
          <Link className="hover:text-accent" href="https://github.com/mayukh4" target="_blank" rel="noreferrer">GitHub</Link>
          <Link className="hover:text-accent" href="https://www.linkedin.com/in/mayukh-bagchi/" target="_blank" rel="noreferrer">LinkedIn</Link>
          <Link className="hover:text-accent" href="mailto:mayukh.bagchi@queensu.ca">Email</Link>
          <Link className="hover:text-accent" href="https://www.youtube.com/@mayukh_bagchi" target="_blank" rel="noreferrer">YouTube</Link>
        </nav>
      </div>
    </footer>
  );
}


