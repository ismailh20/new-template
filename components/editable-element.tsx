"use client"

import { useState } from "react"
import { useEditing } from "@/components/editing-context"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface EditableElementProps {
  type: "text" | "textarea" | "image" | "button"
  elementId: string
  className?: string
  defaultValue: string
  alt?: string
}

interface TypographyStyles {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textAlign?: string
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  textColor?: string
  backgroundColor?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  paddingTop?: string
  paddingBottom?: string
  paddingLeft?: string
  paddingRight?: string
  dropCap?: boolean
  customClass?: string
  responsiveSizes?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

interface ButtonStyles {
  href?: string
  linkType?: "internal" | "external" | "mailto" | "tel" | "anchor"
  target?: "_self" | "_blank"

  variant?: "fill" | "outline" | "gradient"
  backgroundColor?: string
  textColor?: string
  borderColor?: string

  fontFamily?: string
  fontSize?: string
  fontWeight?: string

  borderRadius?: string
  borderStyle?: "solid" | "dashed" | "dotted"
  borderWidth?: string

  padding?: string
  alignment?: "left" | "center" | "right" | "full"

  customClass?: string
}

export function EditableElement({ type, elementId, className, defaultValue, alt }: EditableElementProps) {
  const { isEditing, updateElement, elements } = useEditing()
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState(defaultValue)
  const [tempImage, setTempImage] = useState(defaultValue)
  const [tempStyles, setTempStyles] = useState<TypographyStyles>({})
  const [tempButtonStyles, setTempButtonStyles] = useState<ButtonStyles>({})

  const currentValue = elements[elementId] || defaultValue
  const currentStyles = (elements[`${elementId}_styles`] as TypographyStyles) || {}
  const currentButtonStyles = (elements[`${elementId}_button_styles`] as ButtonStyles) || {}

  const getButtonClasses = (styles: ButtonStyles) => {
    const classes = []

    console.log("[v0] Button styles input:", styles)

    classes.push(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
    )

    if (styles.variant === "outline") {
      classes.push("border border-input hover:bg-accent hover:text-accent-foreground")
    } else if (styles.variant === "gradient") {
      classes.push(
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70",
      )
    } else {
      if (styles.backgroundColor) {
        classes.push(styles.backgroundColor)
        // Add appropriate text color for custom backgrounds
        if (!styles.textColor) {
          classes.push("text-white") // Default text color for custom backgrounds
        }
      } else {
        // Only add default background if no custom background is specified
        classes.push("bg-primary text-primary-foreground hover:bg-primary/90")
      }
    }

    if (styles.textColor) classes.push(styles.textColor)
    if (styles.borderColor && styles.variant === "outline") {
      classes.push(styles.borderColor.replace("bg-", "border-"))
    }

    if (styles.fontFamily) classes.push(styles.fontFamily)
    if (styles.fontSize) classes.push(styles.fontSize)
    if (styles.fontWeight) classes.push(styles.fontWeight)

    if (styles.borderRadius) classes.push(styles.borderRadius)
    if (styles.borderWidth && styles.variant === "outline") classes.push(styles.borderWidth)

    if (styles.padding) classes.push(styles.padding)

    if (styles.alignment === "full") classes.push("w-full")
    if (styles.alignment === "center") classes.push("mx-auto")
    if (styles.alignment === "right") classes.push("ml-auto")

    if (styles.customClass) classes.push(styles.customClass)

    console.log("[v0] Generated button classes:", classes)

    return classes.join(" ")
  }

  const getTypographyClasses = (styles: TypographyStyles) => {
    const classes = []

    if (styles.fontFamily) classes.push(styles.fontFamily)
    if (styles.fontSize) classes.push(styles.fontSize)
    if (styles.fontWeight) classes.push(styles.fontWeight)
    if (styles.lineHeight) classes.push(styles.lineHeight)
    if (styles.letterSpacing) classes.push(styles.letterSpacing)
    if (styles.textAlign) classes.push(styles.textAlign)
    if (styles.textColor && styles.textColor !== "text-foreground") classes.push(styles.textColor)
    if (styles.backgroundColor && styles.backgroundColor !== "none") classes.push(styles.backgroundColor)

    if (styles.marginTop) classes.push(styles.marginTop)
    if (styles.marginBottom) classes.push(styles.marginBottom)
    if (styles.marginLeft) classes.push(styles.marginLeft)
    if (styles.marginRight) classes.push(styles.marginRight)
    if (styles.paddingTop) classes.push(styles.paddingTop)
    if (styles.paddingBottom) classes.push(styles.paddingBottom)
    if (styles.paddingLeft) classes.push(styles.paddingLeft)
    if (styles.paddingRight) classes.push(styles.paddingRight)

    if (styles.italic) classes.push("italic")
    if (styles.underline) classes.push("underline")
    if (styles.strikethrough) classes.push("line-through")

    if (styles.dropCap)
      classes.push(
        "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1",
      )

    if (styles.responsiveSizes?.mobile) classes.push(styles.responsiveSizes.mobile)
    if (styles.responsiveSizes?.tablet) classes.push(styles.responsiveSizes.tablet)
    if (styles.responsiveSizes?.desktop) classes.push(styles.responsiveSizes.desktop)

    if (styles.customClass) classes.push(styles.customClass)

    return classes.join(" ")
  }

  const handleSave = () => {
    updateElement(elementId, tempValue)
    if (type === "text" || type === "textarea") {
      updateElement(`${elementId}_styles`, tempStyles)
    }
    if (type === "button") {
      updateElement(`${elementId}_button_styles`, tempButtonStyles)
    }
    setIsOpen(false)
  }

  const handleOpenModal = () => {
    setTempValue(currentValue)
    setTempImage(currentValue)
    setTempStyles(currentStyles)
    setTempButtonStyles(currentButtonStyles)
    setIsOpen(true)
  }

  const handleImageSelect = (image: string) => {
    setTempValue(image)
    setTempImage(image)
  }

  const backgroundImages = [
    "/indonesian-contemporary-singer-with-orchestra-back.png",
    "/indonesian-female-pop-singer-performing-on-stage.png",
    "/indonesian-indie-folk-singer-with-acoustic-guitar.png",
    "/indonesian-indie-rock-band-with-instruments.png",
    "/indonesian-male-indie-pop-singer-with-guitar.png",
    "/indonesian-rock-band-performing-live-concert.png"
  ]

  const renderContent = () => {
    const appliedStyles = type === "text" || type === "textarea" ? getTypographyClasses(currentStyles) : ""
    const appliedButtonStyles = type === "button" ? getButtonClasses(currentButtonStyles) : ""
    const combinedClassName = cn(className, appliedStyles, appliedButtonStyles)

    switch (type) {
      case "image":
        return <img src={currentValue || "/placeholder.svg"} alt={alt || ""} className={className} />
      case "button":
        const ButtonComponent = () => <Button className={combinedClassName}>{currentValue}</Button>

        if (currentButtonStyles.href) {
          return (
            <a
              href={currentButtonStyles.href}
              target={currentButtonStyles.target || "_self"}
              className={currentButtonStyles.alignment === "full" ? "block" : "inline-block"}
            >
              <ButtonComponent />
            </a>
          )
        }

        return <ButtonComponent />
      case "textarea":
        return (
          <div className={combinedClassName}>
            {currentValue.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )
      default:
        return <div className={combinedClassName}>{currentValue}</div>
    }
  }

  const renderEditModal = () => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit {type === "image" ? "Image" : type === "button" ? "Button" : "Content"}</DialogTitle>
      </DialogHeader>

      {type === "image" ? (
        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Image</TabsTrigger>
            <TabsTrigger value="url">Custom URL</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {backgroundImages.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    tempImage === image
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Background option ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  {tempImage === image && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">Selected</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={tempValue}
                onChange={(e) => {
                  setTempValue(e.target.value)
                  setTempImage(e.target.value)
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {tempValue && (
              <div className="mt-4">
                <Label>Preview</Label>
                <img
                  src={tempValue || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border mt-2"
                  onError={() => setTempImage("")}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : type === "button" ? (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="border">Border</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="mt-2"
                placeholder="Button Label"
              />
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="link-url">Link URL</Label>
              <Input
                id="link-url"
                value={tempButtonStyles.href || ""}
                onChange={(e) => setTempButtonStyles({ ...tempButtonStyles, href: e.target.value })}
                placeholder="https://example.com or /page or mailto:email@example.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Link Type</Label>
              <Select
                value={tempButtonStyles.linkType || "internal"}
                onValueChange={(value: "internal" | "external" | "mailto" | "tel" | "anchor") =>
                  setTempButtonStyles({ ...tempButtonStyles, linkType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Internal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Link</SelectItem>
                  <SelectItem value="external">External Link</SelectItem>
                  <SelectItem value="mailto">Email Link</SelectItem>
                  <SelectItem value="tel">Phone Link</SelectItem>
                  <SelectItem value="anchor">Anchor Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target</Label>
              <Select
                value={tempButtonStyles.target || "_self"}
                onValueChange={(value: "_self" | "_blank") =>
                  setTempButtonStyles({ ...tempButtonStyles, target: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Same Tab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same Tab</SelectItem>
                  <SelectItem value="_blank">New Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div>
              <Label>Button Style</Label>
              <Select
                value={tempButtonStyles.variant || "fill"}
                onValueChange={(value: "fill" | "outline" | "gradient") =>
                  setTempButtonStyles({ ...tempButtonStyles, variant: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fill">Fill (Solid)</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <Select
                  value={tempButtonStyles.backgroundColor || "bg-primary"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, backgroundColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Primary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-primary">Primary</SelectItem>
                    <SelectItem value="bg-secondary">Secondary</SelectItem>
                    <SelectItem value="bg-red-500">Red</SelectItem>
                    <SelectItem value="bg-blue-500">Blue</SelectItem>
                    <SelectItem value="bg-green-500">Green</SelectItem>
                    <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                    <SelectItem value="bg-purple-500">Purple</SelectItem>
                    <SelectItem value="bg-orange-500">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Text Color</Label>
                <Select
                  value={tempButtonStyles.textColor || "text-primary-foreground"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, textColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-primary-foreground">Default</SelectItem>
                    <SelectItem value="text-white">White</SelectItem>
                    <SelectItem value="text-black">Black</SelectItem>
                    <SelectItem value="text-red-500">Red</SelectItem>
                    <SelectItem value="text-blue-500">Blue</SelectItem>
                    <SelectItem value="text-green-500">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Border Color</Label>
              <Select
                value={tempButtonStyles.borderColor || "bg-primary"}
                onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, borderColor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Primary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-primary">Primary</SelectItem>
                  <SelectItem value="bg-secondary">Secondary</SelectItem>
                  <SelectItem value="bg-red-500">Red</SelectItem>
                  <SelectItem value="bg-blue-500">Blue</SelectItem>
                  <SelectItem value="bg-green-500">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Font Family</Label>
                <Select
                  value={tempButtonStyles.fontFamily || "font-sans"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sans Serif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-sans">Sans Serif</SelectItem>
                    <SelectItem value="font-serif">Serif</SelectItem>
                    <SelectItem value="font-mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Size</Label>
                <Select
                  value={tempButtonStyles.fontSize || "text-sm"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Small" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xs">Extra Small</SelectItem>
                    <SelectItem value="text-sm">Small</SelectItem>
                    <SelectItem value="text-base">Medium</SelectItem>
                    <SelectItem value="text-lg">Large</SelectItem>
                    <SelectItem value="text-xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Weight</Label>
                <Select
                  value={tempButtonStyles.fontWeight || "font-medium"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-light">Light</SelectItem>
                    <SelectItem value="font-normal">Normal</SelectItem>
                    <SelectItem value="font-medium">Medium</SelectItem>
                    <SelectItem value="font-semibold">Semibold</SelectItem>
                    <SelectItem value="font-bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="border" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Border Radius</Label>
                <Select
                  value={tempButtonStyles.borderRadius || "rounded-md"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, borderRadius: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded-none">None</SelectItem>
                    <SelectItem value="rounded-sm">Small</SelectItem>
                    <SelectItem value="rounded-md">Medium</SelectItem>
                    <SelectItem value="rounded-lg">Large</SelectItem>
                    <SelectItem value="rounded-xl">Extra Large</SelectItem>
                    <SelectItem value="rounded-full">Pill Shape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Border Style</Label>
                <Select
                  value={tempButtonStyles.borderStyle || "solid"}
                  onValueChange={(value: "solid" | "dashed" | "dotted") =>
                    setTempButtonStyles({ ...tempButtonStyles, borderStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Solid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Border Width</Label>
                <Select
                  value={tempButtonStyles.borderWidth || "border"}
                  onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, borderWidth: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="border-0">None</SelectItem>
                    <SelectItem value="border">Default</SelectItem>
                    <SelectItem value="border-2">Thick</SelectItem>
                    <SelectItem value="border-4">Extra Thick</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>Padding</Label>
              <Select
                value={tempButtonStyles.padding || "px-4 py-2"}
                onValueChange={(value) => setTempButtonStyles({ ...tempButtonStyles, padding: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px-2 py-1">Small</SelectItem>
                  <SelectItem value="px-4 py-2">Default</SelectItem>
                  <SelectItem value="px-6 py-3">Large</SelectItem>
                  <SelectItem value="px-8 py-4">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alignment</Label>
              <Select
                value={tempButtonStyles.alignment || "left"}
                onValueChange={(value: "left" | "center" | "right" | "full") =>
                  setTempButtonStyles({ ...tempButtonStyles, alignment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Left" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="button-custom-class">Custom CSS Class</Label>
              <Input
                id="button-custom-class"
                value={tempButtonStyles.customClass || ""}
                onChange={(e) => setTempButtonStyles({ ...tempButtonStyles, customClass: e.target.value })}
                placeholder="custom-button-class"
                className="mt-2"
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              {type === "textarea" ? (
                <Textarea
                  id="content"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              ) : (
                <Input id="content" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="mt-2" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Font Family</Label>
                <Select
                  value={tempStyles.fontFamily || "font-sans"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sans Serif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-sans">Sans Serif</SelectItem>
                    <SelectItem value="font-serif">Serif</SelectItem>
                    <SelectItem value="font-mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Size</Label>
                <Select
                  value={tempStyles.fontSize || "text-base"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xs">Extra Small</SelectItem>
                    <SelectItem value="text-sm">Small</SelectItem>
                    <SelectItem value="text-base">Medium</SelectItem>
                    <SelectItem value="text-lg">Large</SelectItem>
                    <SelectItem value="text-xl">Extra Large</SelectItem>
                    <SelectItem value="text-2xl">2XL</SelectItem>
                    <SelectItem value="text-3xl">3XL</SelectItem>
                    <SelectItem value="text-4xl">4XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Weight</Label>
                <Select
                  value={tempStyles.fontWeight || "font-normal"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-thin">Thin</SelectItem>
                    <SelectItem value="font-light">Light</SelectItem>
                    <SelectItem value="font-normal">Normal</SelectItem>
                    <SelectItem value="font-medium">Medium</SelectItem>
                    <SelectItem value="font-semibold">Semibold</SelectItem>
                    <SelectItem value="font-bold">Bold</SelectItem>
                    <SelectItem value="font-extrabold">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Text Alignment</Label>
                <Select
                  value={tempStyles.textAlign || "text-left"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, textAlign: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Left" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-left">Left</SelectItem>
                    <SelectItem value="text-center">Center</SelectItem>
                    <SelectItem value="text-right">Right</SelectItem>
                    <SelectItem value="text-justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Line Height</Label>
                <Select
                  value={tempStyles.lineHeight || "leading-normal"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, lineHeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leading-tight">Tight</SelectItem>
                    <SelectItem value="leading-normal">Normal</SelectItem>
                    <SelectItem value="leading-relaxed">Relaxed</SelectItem>
                    <SelectItem value="leading-loose">Loose</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Letter Spacing</Label>
                <Select
                  value={tempStyles.letterSpacing || "tracking-normal"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, letterSpacing: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tracking-tight">Tight</SelectItem>
                    <SelectItem value="tracking-normal">Normal</SelectItem>
                    <SelectItem value="tracking-wide">Wide</SelectItem>
                    <SelectItem value="tracking-wider">Wider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Responsive Font Sizes</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label className="text-sm">Mobile</Label>
                  <Select
                    value={tempStyles.responsiveSizes?.mobile || "text-sm"}
                    onValueChange={(value) =>
                      setTempStyles({
                        ...tempStyles,
                        responsiveSizes: { ...tempStyles.responsiveSizes, mobile: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="SM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xs">XS</SelectItem>
                      <SelectItem value="text-sm">SM</SelectItem>
                      <SelectItem value="text-base">Base</SelectItem>
                      <SelectItem value="text-lg">LG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Tablet</Label>
                  <Select
                    value={tempStyles.responsiveSizes?.tablet || "md:text-base"}
                    onValueChange={(value) =>
                      setTempStyles({
                        ...tempStyles,
                        responsiveSizes: { ...tempStyles.responsiveSizes, tablet: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Base" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="md:text-sm">SM</SelectItem>
                      <SelectItem value="md:text-base">Base</SelectItem>
                      <SelectItem value="md:text-lg">LG</SelectItem>
                      <SelectItem value="md:text-xl">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Desktop</Label>
                  <Select
                    value={tempStyles.responsiveSizes?.desktop || "lg:text-lg"}
                    onValueChange={(value) =>
                      setTempStyles({
                        ...tempStyles,
                        responsiveSizes: { ...tempStyles.responsiveSizes, desktop: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="LG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lg:text-base">Base</SelectItem>
                      <SelectItem value="lg:text-lg">LG</SelectItem>
                      <SelectItem value="lg:text-xl">XL</SelectItem>
                      <SelectItem value="lg:text-2xl">2XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Text Color</Label>
                <Select
                  value={tempStyles.textColor || "text-foreground"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, textColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-foreground">Default</SelectItem>
                    <SelectItem value="text-primary">Primary</SelectItem>
                    <SelectItem value="text-secondary">Secondary</SelectItem>
                    <SelectItem value="text-muted-foreground">Muted</SelectItem>
                    <SelectItem value="text-red-500">Red</SelectItem>
                    <SelectItem value="text-blue-500">Blue</SelectItem>
                    <SelectItem value="text-green-500">Green</SelectItem>
                    <SelectItem value="text-yellow-500">Yellow</SelectItem>
                    <SelectItem value="text-purple-500">Purple</SelectItem>
                    <SelectItem value="text-white">White</SelectItem>
                    <SelectItem value="text-black">Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background Color</Label>
                <Select
                  value={tempStyles.backgroundColor || "none"}
                  onValueChange={(value) => setTempStyles({ ...tempStyles, backgroundColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bg-primary">Primary</SelectItem>
                    <SelectItem value="bg-secondary">Secondary</SelectItem>
                    <SelectItem value="bg-muted">Muted</SelectItem>
                    <SelectItem value="bg-red-100">Light Red</SelectItem>
                    <SelectItem value="bg-blue-100">Light Blue</SelectItem>
                    <SelectItem value="bg-green-100">Light Green</SelectItem>
                    <SelectItem value="bg-yellow-100">Light Yellow</SelectItem>
                    <SelectItem value="bg-purple-100">Light Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Text Effects</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="italic"
                    checked={tempStyles.italic}
                    onCheckedChange={(checked) => setTempStyles({ ...tempStyles, italic: checked as boolean })}
                  />
                  <Label htmlFor="italic">Italic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="underline"
                    checked={tempStyles.underline}
                    onCheckedChange={(checked) => setTempStyles({ ...tempStyles, underline: checked as boolean })}
                  />
                  <Label htmlFor="underline">Underline</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="strikethrough"
                    checked={tempStyles.strikethrough}
                    onCheckedChange={(checked) => setTempStyles({ ...tempStyles, strikethrough: checked as boolean })}
                  />
                  <Label htmlFor="strikethrough">Strikethrough</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dropCap"
                    checked={tempStyles.dropCap}
                    onCheckedChange={(checked) => setTempStyles({ ...tempStyles, dropCap: checked as boolean })}
                  />
                  <Label htmlFor="dropCap">Drop Cap</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="customClass">Custom CSS Class</Label>
              <Input
                id="customClass"
                value={tempStyles.customClass}
                onChange={(e) => setTempStyles({ ...tempStyles, customClass: e.target.value })}
                placeholder="custom-class-name"
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-6">
            <div>
              <Label>Margin</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-sm">Top</Label>
                  <Select
                    value={tempStyles.marginTop || "mt-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, marginTop: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mt-0">None</SelectItem>
                      <SelectItem value="mt-1">1</SelectItem>
                      <SelectItem value="mt-2">2</SelectItem>
                      <SelectItem value="mt-4">4</SelectItem>
                      <SelectItem value="mt-6">6</SelectItem>
                      <SelectItem value="mt-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Bottom</Label>
                  <Select
                    value={tempStyles.marginBottom || "mb-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, marginBottom: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mb-0">None</SelectItem>
                      <SelectItem value="mb-1">1</SelectItem>
                      <SelectItem value="mb-2">2</SelectItem>
                      <SelectItem value="mb-4">4</SelectItem>
                      <SelectItem value="mb-6">6</SelectItem>
                      <SelectItem value="mb-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Left</Label>
                  <Select
                    value={tempStyles.marginLeft || "ml-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, marginLeft: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml-0">None</SelectItem>
                      <SelectItem value="ml-1">1</SelectItem>
                      <SelectItem value="ml-2">2</SelectItem>
                      <SelectItem value="ml-4">4</SelectItem>
                      <SelectItem value="ml-6">6</SelectItem>
                      <SelectItem value="ml-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Right</Label>
                  <Select
                    value={tempStyles.marginRight || "mr-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, marginRight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr-0">None</SelectItem>
                      <SelectItem value="mr-1">1</SelectItem>
                      <SelectItem value="mr-2">2</SelectItem>
                      <SelectItem value="mr-4">4</SelectItem>
                      <SelectItem value="mr-6">6</SelectItem>
                      <SelectItem value="mr-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label>Padding</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-sm">Top</Label>
                  <Select
                    value={tempStyles.paddingTop || "pt-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, paddingTop: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-0">None</SelectItem>
                      <SelectItem value="pt-1">1</SelectItem>
                      <SelectItem value="pt-2">2</SelectItem>
                      <SelectItem value="pt-4">4</SelectItem>
                      <SelectItem value="pt-6">6</SelectItem>
                      <SelectItem value="pt-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Bottom</Label>
                  <Select
                    value={tempStyles.paddingBottom || "pb-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, paddingBottom: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pb-0">None</SelectItem>
                      <SelectItem value="pb-1">1</SelectItem>
                      <SelectItem value="pb-2">2</SelectItem>
                      <SelectItem value="pb-4">4</SelectItem>
                      <SelectItem value="pb-6">6</SelectItem>
                      <SelectItem value="pb-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Left</Label>
                  <Select
                    value={tempStyles.paddingLeft || "pl-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, paddingLeft: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pl-0">None</SelectItem>
                      <SelectItem value="pl-1">1</SelectItem>
                      <SelectItem value="pl-2">2</SelectItem>
                      <SelectItem value="pl-4">4</SelectItem>
                      <SelectItem value="pl-6">6</SelectItem>
                      <SelectItem value="pl-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Right</Label>
                  <Select
                    value={tempStyles.paddingRight || "pr-0"}
                    onValueChange={(value) => setTempStyles({ ...tempStyles, paddingRight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pr-0">None</SelectItem>
                      <SelectItem value="pr-1">1</SelectItem>
                      <SelectItem value="pr-2">2</SelectItem>
                      <SelectItem value="pr-4">4</SelectItem>
                      <SelectItem value="pr-6">6</SelectItem>
                      <SelectItem value="pr-8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </DialogContent>
  )

  if (!isEditing) {
    return renderContent()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "relative group cursor-pointer transition-all duration-200",
            "hover:ring-2 hover:ring-primary hover:ring-opacity-50",
            "hover:bg-primary/5 rounded-md p-1 -m-1",
          )}
          onClick={handleOpenModal}
        >
          {renderContent()}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-md">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
              Click to Edit
            </div>
          </div>
        </div>
      </DialogTrigger>
      {renderEditModal()}
    </Dialog>
  )
}
