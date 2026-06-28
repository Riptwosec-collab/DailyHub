import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { EventExpoFairView } from "@/components/events/EventExpoFairView";

export const metadata: Metadata = {
  title: "Events / Expo / Fair | NimbusDaily",
  description: "NimbusDaily monthly event, expo, fair, festival, and outdoor guide with source images and real detail links.",
};

export default function EventsPage() {
  return (
    <AppShell>
      <EventExpoFairView />
    </AppShell>
  );
}
