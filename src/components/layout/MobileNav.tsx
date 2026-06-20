import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scheduled-tasks", label: "Tasks" },
  { href: "/notifications", label: "Notifications" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 rounded-3xl border border-white/10 bg-slate-950/90 p-2 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-2xl px-2 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
