import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/sites/weverse/ProfilePageClient";

export const metadata: Metadata = {
  title: "My Profile & Settings - Weverse",
  description:
    "Manage your Weverse profile, artist studio settings, following feed, and sent fan letters.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
