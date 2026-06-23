import Link from "next/link";
import {
  Car,
  LayoutDashboard,
  Receipt,
  Upload,
  Users,
  CalendarRange,
  Wrench,
  BarChart3,
} from "lucide-react";
import { verifySession } from "@/lib/dal";

const shortcuts = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/renters", label: "Renters", icon: Users },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/service", label: "Service", icon: Wrench },
  { href: "/rentals", label: "Rentals", icon: CalendarRange },
  { href: "/charges", label: "Tickets & tolls", icon: Receipt },
  { href: "/analytics", label: "Insights", icon: BarChart3 },
  { href: "/import", label: "Import data", icon: Upload },
];

export default async function HomePage() {
  const session = await verifySession();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-white px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome, {session.user.name}
      </h1>
      <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <shortcut.icon className="size-6 text-muted-foreground" />
            {shortcut.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
