"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Car, Utensils } from "lucide-react";
import { EditableElement } from "@/components/editable-element";
import { useEditing } from "@/components/editing-context";
import { useState, useEffect } from "react";

interface VenueData {
  location: string;
  capacity: number;
  image_venue: string;
  facilities?: Facilities;
}

interface Facilities {
  parking: string;
  food_court: string;
}

interface VenueSectionProps {
  eventId: string;
  merchantId: string;
}

export function VenueSection({ eventId, merchantId }: VenueSectionProps) {
  const { isEditing } = useEditing();
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVenueData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/facilities/venue?event_id=${eventId}&merchant_id=${merchantId}`
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("[v0] Venue API error:", res);
      } else if (data) {
        setVenueData(data);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch venue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueData();
  }, [eventId]); // Add eventId to dependency array to refetch when eventId changes

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <EditableElement
            type="text"
            elementId="venue-title"
            className="text-4xl md:text-6xl font-black text-foreground mb-4"
            defaultValue="VENUE INFO"
          />
          <EditableElement
            type="text"
            elementId="venue-subtitle"
            className="text-xl text-foreground/80 text-pretty"
            defaultValue="Lokasi terbaik untuk pengalaman musik yang tak terlupakan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Venue Image */}
          <div className="relative">
            <EditableElement
              type="image"
              elementId="venue-image"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              defaultValue={`/api/upload?file=${venueData?.image_venue}`}
              alt="Jakarta International Expo"
            />
          </div>

          {/* Venue Details */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-card-foreground">
                  <MapPin className="w-6 h-6 text-primary" />
                  <EditableElement
                    type="text"
                    elementId="venue-location-title"
                    className=""
                    defaultValue="Lokasi"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableElement
                  type="textarea"
                  elementId="venue-location-details"
                  className="text-card-foreground/80 text-lg whitespace-pre-line"
                  defaultValue={
                    venueData?.location
                      ? `${venueData.location}
Jl. Boulevard Barat Raya, Kelapa Gading
Jakarta Utara 14240`
                      : `Jakarta International Expo (JIExpo)
Jl. Boulevard Barat Raya, Kelapa Gading
Jakarta Utara 14240`
                  }
                />
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-card-foreground">
                  <Users className="w-6 h-6 text-primary" />
                  <EditableElement
                    type="text"
                    elementId="venue-capacity-title"
                    className=""
                    defaultValue="Kapasitas"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-card-foreground/80 text-lg">
                  <EditableElement
                    type="text"
                    elementId="venue-capacity-number"
                    className="font-bold text-primary text-2xl inline"
                    defaultValue={
                      venueData?.capacity
                        ? venueData.capacity.toLocaleString()
                        : "50,000"
                    }
                  />
                  <EditableElement
                    type="text"
                    elementId="venue-capacity-desc"
                    className="inline"
                    defaultValue=" pengunjung per hari"
                  />
                  <br />
                  <EditableElement
                    type="text"
                    elementId="venue-area-info"
                    className=""
                    defaultValue="Area indoor dan outdoor tersedia"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <Car className="w-5 h-5 text-accent" />
                    <EditableElement
                      type="text"
                      elementId="venue-parking-title"
                      className=""
                      defaultValue="Parkir"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditableElement
                    type="text"
                    elementId="venue-parking-info"
                    className="text-card-foreground/80"
                    defaultValue={
                      venueData?.facilities?.parking ||
                      "5,000+ slot parkir tersedia"
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                    <Utensils className="w-5 h-5 text-accent" />
                    <EditableElement
                      type="text"
                      elementId="venue-food-title"
                      className=""
                      defaultValue="Food Court"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditableElement
                    type="text"
                    elementId="venue-food-info"
                    className="text-card-foreground/80"
                    defaultValue={
                      venueData?.facilities?.food_court ||
                      "50+ tenant makanan & minuman"
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
