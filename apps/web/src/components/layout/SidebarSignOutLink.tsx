"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./AppShell.module.css";

export function SidebarSignOutLink() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles["sidebar-sign-out"]}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? "Signing out…" : "Log out"}
    </button>
  );
}
