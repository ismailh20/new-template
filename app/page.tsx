"use client";

import { useSearchParams } from "next/navigation";
import { EditingProvider } from "../components/editing-context";
import { EditModeToggle } from "../components/edit-mode-toggle";
import { HeroSection } from "../components/hero-section";
import { GuestStarsSection } from "../components/guest-stars-section";
import { VenueSection } from "../components/venue-section";
import { EventForm } from "../components/event-form";

export default function Page() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id") || "3";
  const merchantId = searchParams.get("merchant_id") || "3";

  const showEditMode = searchParams.get("edit") === "true";

  return (
    <EditingProvider>
      <div className="min-h-screen bg-gray-900">
        {showEditMode && <EditModeToggle />}
        <HeroSection eventId={eventId} merchantId={merchantId} />
        <GuestStarsSection eventId={eventId} />
        <VenueSection eventId={eventId} merchantId={merchantId} />
        <EventForm eventId={eventId} />
      </div>
    </EditingProvider>
  );
}
