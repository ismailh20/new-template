"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Save, X } from "lucide-react"

interface HeroData {
  title: string
  year: string
  subtitle: string
  date: string
  location: string
  backgroundImage: string
}

interface HeroEditModalProps {
  isOpen: boolean
  onClose: () => void
  heroData: HeroData
  onSave: (data: HeroData) => void
}

export function HeroEditModal({ isOpen, onClose, heroData, onSave }: HeroEditModalProps) {
  const [formData, setFormData] = useState<HeroData>(heroData)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    setFormData(heroData)
  }, [heroData])

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const handlePreview = () => {
    onSave(formData)
    setIsPreviewMode(true)
  }

  const backgroundOptions = [
    "/indonesian-contemporary-singer-with-orchestra-back.png",
    "/indonesian-female-pop-singer-performing-on-stage.png",
    "/indonesian-indie-folk-singer-with-acoustic-guitar.png",
    "/indonesian-indie-rock-band-with-instruments.png",
    "/indonesian-male-indie-pop-singer-with-guitar.png",
    "indonesian-rock-band-performing-live-concert.png"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Hero Section
            {isPreviewMode && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Preview Mode</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isPreviewMode && (
          <div className="mb-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('${formData.backgroundImage}')`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {formData.title}
                    <span className="block text-xl md:text-2xl text-primary font-bold mt-1">{formData.year}</span>
                  </h1>
                  <p className="text-sm md:text-base text-white/90 mb-4">{formData.subtitle}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white text-sm">
                    <span>{formData.date}</span>
                    <span>{formData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <div>
              <Label>Background Image</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {backgroundOptions.map((bg, index) => (
                  <div
                    key={index}
                    className={`relative h-24 bg-cover bg-center rounded-lg cursor-pointer border-2 transition-colors ${
                      formData.backgroundImage === bg ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${bg}')`,
                    }}
                    onClick={() => setFormData({ ...formData, backgroundImage: bg })}
                  >
                    {formData.backgroundImage === bg && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Selected</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="customBg">Custom Background URL</Label>
              <Input
                id="customBg"
                value={formData.backgroundImage}
                onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2 bg-transparent">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            {isPreviewMode && (
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                Edit
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex items-center gap-2 bg-transparent">
              <X className="w-4 h-4" />
              Close
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
