"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { EditableElement } from "@/components/editable-element";
import { useEditing } from "@/components/editing-context";
import { createBrowserClient } from "@supabase/ssr";

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  ticketQuantity: string;
  ticketType: string;
  age: string;
  gender: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  bookingDetails?: {
    ticketId: string;
    orderId: string;
    totalPrice: number;
    days: number;
  };
}

interface TicketType {
  id: number;
  ticket_type: string;
  price: number;
  quantity_available: number;
  valid_from_date: string;
  valid_to_date: string;
  access_special_show: boolean;
  displayText: string;
}

interface EventFormProps {
  eventId: string;
}

// Simple QR Code component using a placeholder service
function QRCode({ data }: { data: string }) {
  const qrData = encodeURIComponent(data);
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`}
          alt="QR Code Tiket"
          className="w-48 h-48"
        />
      </div>
      <p className="text-amber-400 text-sm text-center">
        Scan QR code ini untuk verifikasi tiket
      </p>
    </div>
  );
}

export function EventForm({ eventId }: EventFormProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { isEditing } = useEditing();

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const eventFormRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    ticketQuantity: "",
    ticketType: "",
    age: "",
    gender: "",
    startDate: undefined,
    endDate: undefined,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("transactionData")) {
      const savedData = localStorage.getItem("transactionData");
      if (savedData) {
        setIsSubmitted(true);
        setFormData(JSON.parse(savedData));
        setTimeout(() => {
          if (eventFormRef.current) {
            eventFormRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 1000);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      setIsLoadingTickets(true);
      try {
        const res = await fetch(
          `http://localhost:3000/tickets/event?event_id=${eventId}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("[v0] Supabase tickets error:", data);
        } else if (data) {
          // Transform data to match expected format
          const transformedData = data.map((ticket: any) => ({
            ...ticket,
            displayText: `${
              ticket.ticket_type
            } - Rp ${ticket.price.toLocaleString()}`,
          }));
          setTicketTypes(transformedData);
        }
      } catch (error) {
        console.error("[v0] Failed to fetch ticket types:", error);
      } finally {
        setIsLoadingTickets(false);
      }
    };

    fetchTicketTypes();
  }, [eventId]); // Add eventId to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      const resUser = await fetch("http://localhost:3000/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const dataUser = await resUser.json();
      console.log(dataUser, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");


      if (!resUser.ok) {
        console.error("[v0] User insert error:", dataUser);
      }

      const orderData = {
        user_id: dataUser?.id,
        event_id: Number.parseInt(eventId),
        order_date: new Date().toISOString(),
        status: "paid",
        quantity: Number.parseInt(formData.ticketQuantity),
        price:
          ticketTypes.find((t) => formData.ticketType.includes(t.ticket_type))
            ?.price! * Number.parseInt(formData.ticketQuantity),
        ticket_id: ticketTypes.find((t) =>
          formData.ticketType.includes(t.ticket_type)
        )?.id,
      };

      const resOrder = await fetch("http://localhost:3000/order-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const dataOrder = await resOrder.json()

      console.log(dataOrder, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
      

      if (!resOrder.ok) {
        console.error("[v0] Order insert error:", dataOrder);
      }

      const ticketDetail = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: formData.age,
        gender: formData.gender,
        ticket_status: "valid",
        event_date: startDate?.toISOString().split("T")[0] || null,
        order_id: dataOrder.id,
      };

      const resTicket = await fetch("http://localhost:3000/ticket-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketDetail),
      });

      const dataTicket = await resTicket.json()

      if (!resTicket.ok) {
        console.error("[v0] Booking failed:", dataOrder);
        alert(`Booking failed: ${dataOrder}`);
      } else if (dataTicket) {
        // Update form data with booking details
        const updatedFormData = {
          ...formData,
          startDate,
          endDate,
          bookingDetails: {
            ticketId: `JF2024-${dataTicket.id}`,
            orderId: dataTicket.id.toString(),
            totalPrice: dataTicket.ticket_quantity * 350000, // Calculate based on ticket type
            days: 1,
          },
        };
        setFormData(updatedFormData);
        setIsSubmitted(true);
        localStorage.setItem(
          "transactionData",
          JSON.stringify(updatedFormData)
        );
        window.location.href =
          "http://localhost:3001/payment/review-transaction";
      }
    } catch (error) {
      console.error("[v0] Booking error:", error);
      alert("Booking failed: Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketTypeChange = (value: string) => {
    setFormData({ ...formData, ticketType: value, ticketQuantity: "" }); // Reset quantity when ticket type changes

    // Find the selected ticket object to get quantity_available
    const ticket = ticketTypes.find((t) => t.displayText === value);
    setSelectedTicket(ticket || null);

    setStartDate(undefined);
    setEndDate(undefined);
  };

  const maxQuantity = selectedTicket ? selectedTicket.quantity_available : 10;
  const isQuantityDisabled = !formData.ticketType || isLoadingTickets;

  const getValidDateRange = () => {
    if (!selectedTicket) return { fromDate: undefined, toDate: undefined };

    return {
      fromDate: new Date(selectedTicket.valid_from_date),
      toDate: new Date(selectedTicket.valid_to_date),
    };
  };

  const { fromDate, toDate } = getValidDateRange();
  const areDatesDisabled = !selectedTicket || isLoadingTickets;

  const isDateDisabled = (date: Date) => {
    if (!selectedTicket) return true;

    const dateToCheck = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const validFrom = new Date(selectedTicket.valid_from_date);
    const validFromNormalized = new Date(
      validFrom.getFullYear(),
      validFrom.getMonth(),
      validFrom.getDate()
    );
    const validTo = new Date(selectedTicket.valid_to_date);
    const validToNormalized = new Date(
      validTo.getFullYear(),
      validTo.getMonth(),
      validTo.getDate()
    );

    const isDisabled =
      dateToCheck < validFromNormalized || dateToCheck > validToNormalized;

    // Return true if date is OUTSIDE the valid range (should be disabled)
    // Use <= and >= to include boundary dates
    return isDisabled;
  };

  if (isLoading) {
    return (
      <section
        id="booking-loading"
        className="py-20 px-4 relative overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #1a1a1a 50%, #2d1810 75%, #1a1a1a 100%),
            radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
          `,
        }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-amber-500/20 rotate-45"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-amber-500/15 rotate-12"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-amber-500/10 rotate-45"></div>
          <div className="absolute bottom-40 right-10 w-28 h-28 border border-amber-500/20 rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rotate-45"></div>
        </div>

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="border border-amber-500/20 shadow-2xl backdrop-blur-sm bg-black/40">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Memproses Pesanan...
                </h2>
                <p className="text-white/80 text-lg">
                  Mohon tunggu sebentar, kami sedang memproses tiket Anda
                </p>
                <div className="flex justify-center space-x-2 mt-8">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (isSubmitted) {
    const ticketId =
      formData.bookingDetails?.ticketId ||
      `JF2024-${Date.now().toString().slice(-6)}`;
    const qrData = JSON.stringify({
      ticketId,
      orderId: formData.bookingDetails?.orderId,
      name: formData.name,
      email: formData.email,
      ticketType: formData.ticketType,
      quantity: formData.ticketQuantity,
      totalPrice: formData.bookingDetails?.totalPrice,
      days: formData.bookingDetails?.days,
      event: `Event ${eventId}`,
    });

    return (
      <section
        id="booking-success"
        className="py-20 px-4 relative overflow-hidden"
        ref={eventFormRef}
        style={{
          background: `
            linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #1a1a1a 50%, #2d1810 75%, #1a1a1a 100%),
            radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
          `,
        }}
      >
        {/* ... existing background decorations ... */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-amber-500/20 rotate-45"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-amber-500/15 rotate-12"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-amber-500/10 rotate-45"></div>
          <div className="absolute bottom-40 right-10 w-28 h-28 border border-amber-500/20 rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rotate-45"></div>
        </div>

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mr-4" />
              <h1 className="text-4xl md:text-6xl font-black text-white">
                TIKET BERHASIL DIPESAN!
              </h1>
            </div>
            <p className="text-xl text-white/80 text-pretty">
              Terima kasih! Tiket Anda telah berhasil dipesan untuk Event{" "}
              {eventId}
            </p>
          </div>

          <Card className="border border-amber-500/20 shadow-2xl backdrop-blur-sm bg-black/40">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <QRCode data={qrData} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-400 mb-4">
                    Informasi Tiket
                  </h3>
                  <div>
                    <span className="text-white/60">ID Tiket:</span>
                    <p className="font-mono text-amber-400">{ticketId}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Nama:</span>
                    <p className="font-semibold">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Email:</span>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-white/60">No. HP:</span>
                    <p>{formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Alamat:</span>
                    <p className="text-sm">{formData.address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-400 mb-4">
                    Detail Pemesanan
                  </h3>
                  <div>
                    <span className="text-white/60">Jenis Tiket:</span>
                    <p className="font-semibold">{formData.ticketType}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Jumlah Tiket:</span>
                    <p>{formData.ticketQuantity} tiket</p>
                  </div>
                  <div>
                    <span className="text-white/60">Usia:</span>
                    <p>{formData.age} tahun</p>
                  </div>
                  <div>
                    <span className="text-white/60">Jenis Kelamin:</span>
                    <p>{formData.gender}</p>
                  </div>
                  {formData.startDate && (
                    <div>
                      <span className="text-white/60">Tanggal Event:</span>
                      <p>{format(formData.startDate, "PPP", { locale: id })}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm text-center">
                  <strong>Penting:</strong> Simpan QR code ini dan tunjukkan
                  saat masuk venue. Email konfirmasi akan dikirim ke{" "}
                  {formData.email}
                </p>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setIsLoading(false);
                    localStorage.removeItem("transactionData");
                    setFormData({
                      name: "",
                      phone: "",
                      email: "",
                      address: "",
                      ticketQuantity: "",
                      ticketType: "",
                      age: "",
                      gender: "",
                      startDate: undefined,
                      endDate: undefined,
                    });
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8"
                >
                  Pesan Tiket Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking-form"
      className="py-20 px-4 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, #1a1a1a 0%, #2d1810 25%, #1a1a1a 50%, #2d1810 75%, #1a1a1a 100%),
          radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
        `,
      }}
    >
      {/* ... existing background decorations ... */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-amber-500/20 rotate-45"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-amber-500/15 rotate-12"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-amber-500/10 rotate-45"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 border border-amber-500/20 rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/5 rotate-45"></div>
      </div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <EditableElement
            type="text"
            elementId="form-title"
            className="text-4xl md:text-6xl font-black text-white mb-4"
            defaultValue={`BOOKING TIKET EVENT ${eventId}`}
          />
          <EditableElement
            type="text"
            elementId="form-subtitle"
            className="text-xl text-white/80 text-pretty"
            defaultValue={`Isi form di bawah untuk memesan tiket Event ${eventId}`}
          />
        </div>

        <Card className="border border-amber-500/20 shadow-2xl backdrop-blur-sm bg-black/40">
          <CardHeader>
            <EditableElement
              type="text"
              elementId="form-card-title"
              className="text-2xl font-bold text-white"
              defaultValue="Informasi Pemesanan"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="name-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Nama Lengkap"
                  />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      isEditing
                        ? "Editable placeholder"
                        : "Masukkan nama lengkap"
                    }
                    className="bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500"
                    required
                  />
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="name-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="Masukkan nama lengkap"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="phone-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Nomor HP"
                  />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Editable placeholder" : "08xxxxxxxxxx"
                    }
                    className="bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500"
                    required
                  />
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="phone-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="08xxxxxxxxxx"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <EditableElement
                  type="text"
                  elementId="email-label"
                  className="text-white font-medium block text-sm"
                  defaultValue="Email"
                />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={
                    isEditing ? "Editable placeholder" : "nama@email.com"
                  }
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500"
                  required
                />
                {isEditing && (
                  <EditableElement
                    type="text"
                    elementId="email-placeholder"
                    className="text-xs text-amber-400 mt-1"
                    defaultValue="nama@email.com"
                  />
                )}
              </div>

              <div className="space-y-2">
                <EditableElement
                  type="text"
                  elementId="address-label"
                  className="text-white font-medium block text-sm"
                  defaultValue="Alamat"
                />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={
                    isEditing
                      ? "Editable placeholder"
                      : "Masukkan alamat lengkap"
                  }
                  className="bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500 min-h-[100px]"
                  required
                />
                {isEditing && (
                  <EditableElement
                    type="textarea"
                    elementId="address-placeholder"
                    className="text-xs text-amber-400 mt-1"
                    defaultValue="Masukkan alamat lengkap"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="ticket-quantity-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Jumlah Tiket"
                  />
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={formData.ticketQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ticketQuantity: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing
                        ? "Editable placeholder"
                        : isQuantityDisabled
                        ? "Pilih tiket dulu"
                        : "1"
                    }
                    className={`bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500 ${
                      isQuantityDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isQuantityDisabled}
                    required
                  />
                  {selectedTicket && !isEditing && (
                    <p className="text-xs text-amber-400">
                      Maksimal {maxQuantity} tiket tersedia
                    </p>
                  )}
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="ticket-quantity-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="1"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="ticket-type-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Jenis Tiket"
                  />
                  <Select
                    value={formData.ticketType}
                    onValueChange={handleTicketTypeChange}
                    required
                  >
                    <SelectTrigger className="bg-black/50 border-amber-500/30 text-white focus:border-amber-500">
                      <SelectValue
                        placeholder={
                          isEditing
                            ? "Editable placeholder"
                            : isLoadingTickets
                            ? "Loading..."
                            : "Pilih jenis tiket"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-amber-500/30">
                      {isLoadingTickets ? (
                        <SelectItem
                          value="loading"
                          disabled
                          className="text-white/50"
                        >
                          Loading ticket types...
                        </SelectItem>
                      ) : ticketTypes.length > 0 ? (
                        ticketTypes.map((ticket) => (
                          <SelectItem
                            key={ticket.id}
                            value={ticket.displayText}
                            className="text-white hover:bg-amber-500/20"
                            disabled={ticket.quantity_available === 0}
                          >
                            {ticket.displayText}
                            {ticket.quantity_available <= 100 && (
                              <span
                                className={`text-xs ml-2 ${
                                  ticket.quantity_available === 0
                                    ? "text-red-400"
                                    : "text-amber-400"
                                }`}
                              >
                                {ticket.quantity_available === 0
                                  ? "(Sold Out)"
                                  : `(Tersisa ${ticket.quantity_available})`}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem
                            value="Regular - Rp 350.000"
                            className="text-white hover:bg-amber-500/20"
                          >
                            <EditableElement
                              type="text"
                              elementId="ticket-regular"
                              className="text-white"
                              defaultValue="Regular - Rp 350.000"
                            />
                          </SelectItem>
                          <SelectItem
                            value="VIP - Rp 750.000"
                            className="text-white hover:bg-amber-500/20"
                          >
                            <EditableElement
                              type="text"
                              elementId="ticket-vip"
                              className="text-white"
                              defaultValue="VIP - Rp 750.000"
                            />
                          </SelectItem>
                          <SelectItem
                            value="VVIP - Rp 1.250.000"
                            className="text-white hover:bg-amber-500/20"
                          >
                            <EditableElement
                              type="text"
                              elementId="ticket-vvip"
                              className="text-white"
                              defaultValue="VVIP - Rp 1.250.000"
                            />
                          </SelectItem>
                          <SelectItem
                            value="Festival Pass (3 Hari) - Rp 900.000"
                            className="text-white hover:bg-amber-500/20"
                          >
                            <EditableElement
                              type="text"
                              elementId="ticket-festival-pass"
                              className="text-white"
                              defaultValue="Festival Pass (3 Hari) - Rp 900.000"
                            />
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="ticket-type-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="Pilih jenis tiket"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="start-date-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Tanggal Mulai Event"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-black/50 border-amber-500/30 text-white hover:bg-amber-500/20 focus:border-amber-500 ${
                          areDatesDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={areDatesDisabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, "PPP", { locale: id })
                          : isEditing
                          ? "Editable placeholder"
                          : areDatesDisabled
                          ? "Pilih tiket dulu"
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-black/90 border-amber-500/30"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        fromDate={fromDate}
                        toDate={toDate}
                        disabled={isDateDisabled}
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedTicket && !isEditing && (
                    <p className="text-xs text-amber-400">
                      Tersedia:{" "}
                      {format(
                        new Date(selectedTicket.valid_from_date),
                        "dd MMM",
                        { locale: id }
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(selectedTicket.valid_to_date),
                        "dd MMM yyyy",
                        { locale: id }
                      )}
                    </p>
                  )}
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="start-date-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="Pilih tanggal"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="end-date-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Tanggal Selesai Event"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-black/50 border-amber-500/30 text-white hover:bg-amber-500/20 focus:border-amber-500 ${
                          areDatesDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={areDatesDisabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate
                          ? format(endDate, "PPP", { locale: id })
                          : isEditing
                          ? "Editable placeholder"
                          : areDatesDisabled
                          ? "Pilih tiket dulu"
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-black/90 border-amber-500/30"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        fromDate={fromDate}
                        toDate={toDate}
                        disabled={isDateDisabled}
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedTicket && !isEditing && (
                    <p className="text-xs text-amber-400">
                      Tersedia:{" "}
                      {format(
                        new Date(selectedTicket.valid_from_date),
                        "dd MMM",
                        { locale: id }
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(selectedTicket.valid_to_date),
                        "dd MMM yyyy",
                        { locale: id }
                      )}
                    </p>
                  )}
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="end-date-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="Pilih tanggal"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="age-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Usia"
                  />
                  <Input
                    type="number"
                    min="13"
                    max="100"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder={isEditing ? "Editable placeholder" : "25"}
                    className="bg-black/50 border-amber-500/30 text-white placeholder:text-white/50 focus:border-amber-500"
                    required
                  />
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="age-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="25"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <EditableElement
                    type="text"
                    elementId="gender-label"
                    className="text-white font-medium block text-sm"
                    defaultValue="Jenis Kelamin"
                  />
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-black/50 border-amber-500/30 text-white focus:border-amber-500">
                      <SelectValue
                        placeholder={
                          isEditing
                            ? "Editable placeholder"
                            : "Pilih jenis kelamin"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-amber-500/30">
                      <SelectItem
                        value="Laki-laki"
                        className="text-white hover:bg-amber-500/20"
                      >
                        <EditableElement
                          type="text"
                          elementId="gender-male"
                          className="text-white"
                          defaultValue="Laki-laki"
                        />
                      </SelectItem>
                      <SelectItem
                        value="Perempuan"
                        className="text-white hover:bg-amber-500/20"
                      >
                        <EditableElement
                          type="text"
                          elementId="gender-female"
                          className="text-white"
                          defaultValue="Perempuan"
                        />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isEditing && (
                    <EditableElement
                      type="text"
                      elementId="gender-placeholder"
                      className="text-xs text-amber-400 mt-1"
                      defaultValue="Pilih jenis kelamin"
                    />
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black text-lg font-bold py-4 px-4 rounded-md transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
                >
                  Pesan Tiket Sekarang
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
