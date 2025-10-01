"use client"
import { Calendar, MapPin } from "lucide-react"
import { useEditing } from "@/components/editing-context"
import { EditableElement } from "@/components/editable-element"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface HeroSectionProps {
  eventId: string
  merchantId: string
}

export function HeroSection({ eventId, merchantId }: HeroSectionProps) {
  const { isEditing, elements } = useEditing()
  const [eventData, setEventData] = useState<any>(null)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/events?event_id=${eventId}&merchant_id=${merchantId}`);
        const data = await res.json();

        if (data.error) {
          console.error("[v0] Events query error:", data.error)
          return
        }

        setEventData(data)
      } catch (error) {
        console.error("Failed to fetch event data:", error)
      }
    }

    fetchEventData()
  }, [eventId, merchantId])

  const scrollToForm = () => {
    const formSection = document.getElementById("booking-form")
    if (formSection) {
      formSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const formatEventDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "15-17 Desember 2024"

    const start = new Date(startDate)
    const end = new Date(endDate)

    const startDay = start.getDate()
    const endDay = end.getDate()
    const month = start.toLocaleDateString("id-ID", { month: "long" })
    const year = start.getFullYear()

    return `${startDay}-${endDay} ${month} ${year}`
  }

  const backgroundImage = elements["hero-background"] || "/api/upload?file=" + eventData?.hero_image
  console.log(eventData);
  

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="opacity-0 pointer-events-none absolute">
          <EditableElement
            type="image"
            elementId="hero-background"
            className="w-full h-full object-cover"
            defaultValue={`/api/upload?file=${eventData?.hero_image}`}
          />
        </div>

        {isEditing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <EditableElement
              type="image"
              elementId="hero-background"
              className="bg-black/20 text-white px-4 py-2 rounded-lg border border-white/30"
              defaultValue={`/api/upload?file=${eventData?.hero_image}`}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <EditableElement
          type="text"
          elementId="hero-title"
          className="text-6xl md:text-8xl font-black text-white mb-6 text-balance"
          defaultValue={eventData?.name || "JAKARTA FEST"}
        />

        <EditableElement
          type="text"
          elementId="hero-year"
          className="block text-4xl md:text-6xl text-primary font-bold mt-2 mb-6"
          defaultValue="2024"
        />

        <EditableElement
          type="text"
          elementId="hero-subtitle"
          className="text-xl md:text-2xl text-white/90 mb-8 font-medium text-pretty"
          defaultValue={eventData?.description || "Experience the Beat of Indonesia's Biggest Music Festival"}
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <EditableElement
              type="text"
              elementId="hero-date"
              className="text-lg font-medium"
              defaultValue={
                eventData ? formatEventDate(eventData.start_date, eventData.end_date) : "15-17 Desember 2024"
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            <EditableElement
              type="text"
              elementId="hero-location"
              className="text-lg font-medium"
              defaultValue={eventData?.location || "Jakarta International Expo"}
            />
          </div>
        </div>

        <div onClick={!isEditing ? scrollToForm : undefined}>
          <EditableElement
            type="button"
            elementId="hero-button"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 font-bold cursor-pointer"
            defaultValue="Dapatkan Tiket Sekarang"
          />
        </div>
      </div>
    </section>
  )
}
