"use client"; // Need client directive for using hooks like usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils"; // Assuming your shadcn setup includes this utility
import { buttonVariants } from "@/components/ui/button"; // Assuming shadcn Button is installed

interface AdminSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export default function AdminSidebarNav({ className, items, ...props }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
