"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Car,
  Home,
  LayoutDashboard,
  Receipt,
  Upload,
  Users,
  CalendarRange,
  Wrench,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/renters", label: "Renters", icon: Users },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/service", label: "Service", icon: Wrench },
  { href: "/rentals", label: "Rentals", icon: CalendarRange },
  { href: "/charges", label: "Tickets & tolls", icon: Receipt },
  { href: "/analytics", label: "Insights", icon: BarChart3 },
  { href: "/import", label: "Import data", icon: Upload },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 px-3 py-3">
        <Image src="/car-logo.png" alt="" width={20} height={20} className="shrink-0" />
        <span className="text-sm font-semibold text-foreground">
          Skyline Auto
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
