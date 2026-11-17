import { AppShell } from "@/components/AppShell";

export default function Layout({ children }: LayoutProps<"/app">) {
  return <AppShell>{children}</AppShell>;
}
