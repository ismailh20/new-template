"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EditableElement } from "@/components/editable-element";
import { useEditing } from "@/components/editing-context";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface GuestStar {
  name: string;
  genre: string;
  image: string;
  day: string;
  stage: string;
  time: string;
}

interface GuestStarsSectionProps {
  eventId: string;
}

const fallbackGuestStars: GuestStar[] = [
  {
    name: "Raisa",
    genre: "Pop",
    image: "/indonesian-female-pop-singer-performing-on-stage.png",
    day: "Hari 1",
    stage: "Main Stage",
    time: "19:00 - 20:30",
  },
  {
    name: "Tulus",
    genre: "Indie Pop",
    image: "/indonesian-male-indie-pop-singer-with-guitar.png",
    day: "Hari 1",
    stage: "Acoustic Stage",
    time: "21:00 - 22:00",
  },
  {
    name: "Sheila On 7",
    genre: "Alternative Rock",
    image: "/indonesian-rock-band-performing-live-concert.png",
    day: "Hari 2",
    stage: "Main Stage",
    time: "20:00 - 21:30",
  },
  {
    name: "Isyana Sarasvati",
    genre: "Contemporary",
    image: "/indonesian-contemporary-singer-with-orchestra-back.png",
    day: "Hari 2",
    stage: "Orchestra Stage",
    time: "18:30 - 19:45",
  },
  {
    name: "Fourtwnty",
    genre: "Indie Rock",
    image: "/indonesian-indie-rock-band-with-instruments.png",
    day: "Hari 3",
    stage: "Rock Stage",
    time: "19:30 - 21:00",
  },
  {
    name: "Pamungkas",
    genre: "Indie Folk",
    image: "/indonesian-indie-folk-singer-with-acoustic-guitar.png",
    day: "Hari 3",
    stage: "Acoustic Stage",
    time: "17:00 - 18:15",
  },
];

export function GuestStarsSection({ eventId }: GuestStarsSectionProps) {
  const { isEditing } = useEditing();
  const [guestStars, setGuestStars] = useState<GuestStar[]>(fallbackGuestStars);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGuestStars = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/guests/stars?event_id=${eventId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch guest stars");
      }

      const guests = await res.json();

      if (guests && guests.length > 0) {
        // Transform the data to match the UI structure
        const transformedGuests = guests.map((guest: any, index: number) => {
          const schedule = guest.guest_schedules?.[0]; // Get first schedule
          const scheduleDate = schedule?.schedule_date
            ? new Date(schedule.schedule_date)
            : null;
          const dayNumber = scheduleDate ? scheduleDate.getDate() - 14 : 1; // Assuming event starts on 15th

          return {
            name: guest.name,
            genre: guest.category || "Music",
            image:
              guest.image ||
              `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(
                guest.name + " performer"
              )}`,
            day: `Hari ${Math.max(1, Math.min(3, dayNumber))}`,
            stage: schedule?.stage || "Main Stage",
            time: schedule
              ? `${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(
                  0,
                  5
                )}`
              : "19:00 - 20:30",
          };
        });

        setGuestStars(transformedGuests);
      }
    } catch (error) {
      console.error("[v0] Error fetching guest stars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestStars();
  }, [eventId]); // Add eventId to dependency array

  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <EditableElement
            type="text"
            elementId="guest-stars-title"
            className="text-4xl md:text-6xl font-black text-card-foreground mb-4"
            defaultValue="GUEST STARS"
          />
          <EditableElement
            type="text"
            elementId="guest-stars-subtitle"
            className="text-xl text-card-foreground/80 text-pretty"
            defaultValue="Artis-artis terbaik Indonesia siap menghibur Anda"
          />
        </div>

        {isLoading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-card-foreground/60">
              Loading guest stars...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guestStars.map((artist, index) => (
            <Card
              key={index}
              className={`group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                isEditing ? "ring-2 ring-primary/50 cursor-pointer" : ""
              }`}
            >
              <div className="relative">
                <EditableElement
                  type="image"
                  elementId={`artist-image-${index}`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  defaultValue={
                    `/api/upload?file=${artist.image}` || "/placeholder.svg"
                  }
                  alt={artist.name}
                />
                <div className="absolute top-4 right-4 space-y-2">
                  <EditableElement
                    type="text"
                    elementId={`artist-day-${index}`}
                    className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg"
                    defaultValue={artist.day}
                  />
                  <EditableElement
                    type="text"
                    elementId={`artist-stage-${index}`}
                    className="block bg-slate-800/90 text-white font-medium px-3 py-1 rounded-full text-xs shadow-md backdrop-blur-sm"
                    defaultValue={artist.stage}
                  />
                </div>
              </div>
              <CardContent className="p-6">
                <EditableElement
                  type="text"
                  elementId={`artist-name-${index}`}
                  className="text-2xl font-bold text-card-foreground mb-2"
                  defaultValue={artist.name}
                />
                <EditableElement
                  type="text"
                  elementId={`artist-genre-${index}`}
                  className="text-card-foreground/70 font-medium mb-3"
                  defaultValue={artist.genre}
                />
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-card-foreground/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <EditableElement
                    type="text"
                    elementId={`artist-time-${index}`}
                    className="text-card-foreground/80 font-medium"
                    defaultValue={artist.time}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
