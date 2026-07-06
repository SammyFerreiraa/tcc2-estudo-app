"use client";

import { BookOpen, Home, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Sidebar } from "@/interface/components/sidebar";
import { SidebarProvider } from "@/interface/components/sidebar/context";
import { Button } from "@/interface/components/ui/button";
import { signOutAction } from "@/server/actions/auth";

interface ProtectedLayoutClientProps {
  children: ReactNode;
}

export function ProtectedLayoutClient({ children }: ProtectedLayoutClientProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <Sidebar.Header>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">Template App</span>
            </div>
          </Sidebar.Header>

          <Sidebar.Content>
            <Sidebar.Item href="/" icon={Home}>
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item href="/admin-page" icon={Users}>
              Admin
            </Sidebar.Item>
            <Sidebar.Item href="/member-page" icon={Users}>
              Member
            </Sidebar.Item>
          </Sidebar.Content>

          <Sidebar.Footer>
            <form action={signOutAction}>
              <Button className="w-full" size="sm" type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </Sidebar.Footer>
        </Sidebar>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
