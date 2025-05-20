"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trash2,
  Plus,
  FileDown,
  Save,
  Info,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Sun,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { Spotlight } from "@/components/ui/spotlight"
import { MovingBorder } from "@/components/ui/moving-border"
import { cn } from "@/lib/utils"

// Dynamically import the PDF generation component to avoid SSR issues
const PDFGenerator = dynamic(() => import("@/components/pdf-generator"), {
  ssr: false,
  loading: () => <p>Loading PDF generator...</p>,
})

interface QuotationItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  total: string
}

interface QuotationData {
  customerName: string
  customerAddress: string
  customerPhone: string
  customerEmail: string
  date: string
  validUntil: string
  items: QuotationItem[]
  notes: string
}

export default function QuotationForm() {
  const { toast } = useToast()
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  // Calculate date 15 days from now for validity
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 15)
  const futureDateString = futureDate.toISOString().split("T")[0]

  const [validUntil, setValidUntil] = useState(futureDateString)
  const [notes, setNotes] = useState("Thank you for your interest in our solar solutions.")
  const [items, setItems] = useState<QuotationItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "0", total: "0" },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPdfGenerator, setShowPdfGenerator] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("customer")
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [isHoveringAdd, setIsHoveringAdd] = useState(false)

  // Preload the PDF scripts when the component mounts
  useEffect(() => {
    const preloadScripts = () => {
      // Create and add jsPDF script
      const script1 = document.createElement("script")
      script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      script1.async = true
      document.body.appendChild(script1)

      script1.onload = () => {
        // After jsPDF is loaded, load the autotable plugin
        const script2 = document.createElement("script")
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"
        script2.async = true
        document.body.appendChild(script2)

        script2.onload = () => {
          setScriptsLoaded(true)
          console.log("PDF scripts loaded successfully")
        }
      }
    }

    preloadScripts()

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="jspdf"]')
      scripts.forEach((script) => script.remove())
    }
  }, [])

  const addNewRow = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: "",
      quantity: "1",
      unitPrice: "0",
      total: "0",
    }
    setItems([...items, newItem])
  }

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Auto-calculate total if quantity and unitPrice are numbers
          if (field === "quantity" || field === "unitPrice") {
            const quantity = Number.parseFloat(field === "quantity" ? value : item.quantity) || 0
            const unitPrice = Number.parseFloat(field === "unitPrice" ? value : item.unitPrice) || 0
            updatedItem.total = (quantity * unitPrice).toFixed(2)
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number.parseFloat(item.total) || 0), 0).toFixed(2)
  }

  const saveQuotation = () => {
    try {
      const quotationData: QuotationData = {
        customerName,
        customerAddress,
        customerPhone,
        customerEmail,
        date,
        validUntil,
        items,
        notes,
      }

      // Get existing quotations or initialize empty array
      const existingQuotations = JSON.parse(localStorage.getItem("quotations") || "[]")

      // Add new quotation with timestamp as ID
      const newQuotations = [
        ...existingQuotations,
        {
          id: Date.now(),
          data: quotationData,
          createdAt: new Date().toISOString(),
        },
      ]

      // Save to localStorage
      localStorage.setItem("quotations", JSON.stringify(newQuotations))

      toast({
        title: "Quotation Saved",
        description: "Your quotation has been saved locally.",
      })
    } catch (error) {
      toast({
        title: "Error Saving",
        description: "Failed to save quotation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generatePDF = () => {
    if (isGenerating) return
    setIsGenerating(true)

    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while your PDF is being generated...",
    })

    // Show the PDF generator component
    setShowPdfGenerator(true)
  }

  const handlePdfGenerationComplete = (success: boolean) => {
    setIsGenerating(false)
    setShowPdfGenerator(false)

    if (success) {
      // Show success dialog instead of toast
      setShowSuccessDialog(true)
    } else {
      toast({
        title: "Error Generating PDF",
        description: "There was a problem generating your PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setCustomerName("")
    setCustomerAddress("")
    setCustomerPhone("")
    setCustomerEmail("")
    setDate(new Date().toISOString().split("T")[0])
    setValidUntil(futureDateString)
    setNotes("Thank you for your interest in our solar solutions.")
    setItems([{ id: "1", description: "", quantity: "1", unitPrice: "0", total: "0" }])
    setActiveTab("customer")
    setShowSuccessDialog(false)
  }

  const isFormValid = () => {
    return (
      customerName.trim() !== "" &&
      items.every(
        (item) =>
          item.description.trim() !== "" &&
          Number.parseFloat(item.quantity) > 0 &&
          Number.parseFloat(item.unitPrice) >= 0,
      )
    )
  }

  // Quick add common solar items
  const commonItems = [
    { description: "Solar Panel 550W Mono", unitPrice: "25000" },
    { description: "Inverter 5kW Hybrid", unitPrice: "85000" },
    { description: "Battery Lithium 5kWh", unitPrice: "120000" },
    { description: "Mounting Structure", unitPrice: "15000" },
    { description: "DC Cables (per meter)", unitPrice: "250" },
    { description: "AC Cables (per meter)", unitPrice: "350" },
    { description: "Installation Service", unitPrice: "20000" },
  ]

  const addCommonItem = (item: { description: string; unitPrice: string }) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: item.description,
      quantity: "1",
      unitPrice: item.unitPrice,
      total: item.unitPrice, // Same as unit price for quantity 1
    }
    setItems([...items, newItem])
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="amber" />

        <div className="relative backdrop-blur-sm bg-black/40 rounded-3xl p-px overflow-hidden">
          <MovingBorder
            duration={3000}
            rx="30px"
            ry="30px"
            className="absolute inset-0"
            gradient1="from-amber-400 via-yellow-300 to-amber-500"
            gradient2="from-yellow-300 via-amber-500 to-yellow-400"
          >
            <div className="absolute inset-0 bg-black/90 rounded-3xl z-[2]" />
          </MovingBorder>

          <Card className="w-full border-0 bg-black/60 backdrop-blur-md rounded-3xl overflow-hidden z-10 relative">
            <CardHeader className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-b border-amber-800/20">
              <CardTitle className="flex items-center text-amber-300 text-xl">
                <FileDown className="h-5 w-5 mr-2 text-amber-400" />
                Create Professional Quotation
              </CardTitle>
            </CardHeader>

            <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none bg-black/50 p-1">
                <TabsTrigger
                  value="customer"
                  className="data-[state=active]:bg-amber-950/50 data-[state=active]:text-amber-300 transition-all duration-200 rounded-md"
                >
                  Customer Details
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="data-[state=active]:bg-amber-950/50 data-[state=active]:text-amber-300 transition-all duration-200 rounded-md"
                >
                  Quotation Items
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {activeTab === "customer" && (
                  <motion.div
                    key="customer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="customer" className="p-0 mt-0">
                      <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="customerName"
                              className="text-sm font-medium flex items-center text-amber-200"
                            >
                              Customer Name*
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 ml-1 text-amber-400/70" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-amber-900 text-amber-100">
                                    <p className="w-80">Full name of the customer or business</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <Input
                              id="customerName"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter customer name"
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customerPhone" className="text-sm font-medium text-amber-200">
                              Customer Phone
                            </Label>
                            <Input
                              id="customerPhone"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter customer phone"
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customerEmail" className="text-sm font-medium text-amber-200">
                              Customer Email
                            </Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="Enter customer email"
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customerAddress" className="text-sm font-medium text-amber-200">
                              Customer Address
                            </Label>
                            <Input
                              id="customerAddress"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              placeholder="Enter customer address"
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-medium text-amber-200">
                              Quotation Date
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="validUntil" className="text-sm font-medium text-amber-200">
                              Valid Until
                            </Label>
                            <Input
                              id="validUntil"
                              type="date"
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium text-amber-200">
                              Notes
                            </Label>
                            <Input
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Additional notes for the quotation"
                              className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <HoverBorderGradient
                            as="button"
                            onClick={() => setActiveTab("items")}
                            className="px-4 py-2 bg-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium transition-all duration-300 flex items-center gap-1"
                            containerClassName="rounded-xl"
                            duration={2000}
                            backgroundClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                            borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                          >
                            Continue to Items
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                          </HoverBorderGradient>
                        </div>
                      </CardContent>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "items" && (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="items" className="p-0 mt-0">
                      <CardContent className="space-y-6 pt-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <h3 className="text-lg font-medium text-amber-200 flex items-center">
                            <Sun className="h-5 w-5 mr-2 text-amber-400" /> Quotation Items
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            <HoverBorderGradient
                              as="button"
                              onClick={addNewRow}
                              className="px-3 py-1 bg-black rounded-lg text-amber-200 font-medium transition-all duration-300 flex items-center gap-1 text-sm"
                              containerClassName="rounded-lg"
                              duration={2000}
                              backgroundClassName="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20"
                              borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                              onMouseEnter={() => setIsHoveringAdd(true)}
                              onMouseLeave={() => setIsHoveringAdd(false)}
                            >
                              <Plus
                                className={`h-4 w-4 transition-transform duration-300 ${
                                  isHoveringAdd ? "rotate-90" : ""
                                }`}
                              />{" "}
                              Add Empty Row
                            </HoverBorderGradient>

                            <div className="relative group">
                              <HoverBorderGradient
                                as="button"
                                className="px-3 py-1 bg-black rounded-lg text-amber-200 font-medium transition-all duration-300 flex items-center gap-1 text-sm"
                                containerClassName="rounded-lg"
                                duration={2000}
                                backgroundClassName="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20"
                                borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                              >
                                <Sparkles className="h-4 w-4 text-amber-400" /> Quick Add Item
                              </HoverBorderGradient>

                              <div className="absolute right-0 mt-1 w-64 bg-black/90 shadow-xl rounded-md border border-amber-800/30 p-2 hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 backdrop-blur-md">
                                <div className="text-xs font-medium text-amber-400 mb-1 px-2">Common Solar Items</div>
                                {commonItems.map((item, index) => (
                                  <motion.button
                                    key={index}
                                    onClick={() => addCommonItem(item)}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-amber-950/50 rounded transition-colors duration-150 text-amber-200"
                                    whileHover={{ x: 2 }}
                                  >
                                    {item.description} - ₨{item.unitPrice}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-md overflow-hidden border-amber-800/30 shadow-sm bg-black/40">
                          <div className="grid grid-cols-12 gap-2 bg-amber-950/50 p-3 border-b border-amber-800/30 text-xs font-medium text-amber-200">
                            <div className="col-span-12 sm:col-span-5">Description</div>
                            <div className="col-span-4 sm:col-span-2">Quantity</div>
                            <div className="col-span-4 sm:col-span-2">Unit Price</div>
                            <div className="col-span-3 sm:col-span-2">Total</div>
                            <div className="col-span-1"></div>
                          </div>

                          <div className="max-h-[400px] overflow-y-auto">
                            <AnimatePresence initial={false}>
                              {items.map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="grid grid-cols-12 gap-2 p-3 border-b border-amber-900/20 hover:bg-amber-950/30 transition-colors items-end"
                                >
                                  <div className="col-span-12 sm:col-span-5">
                                    <Input
                                      id={`description-${item.id}`}
                                      value={item.description}
                                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                      placeholder="Item description"
                                      className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                                      required
                                    />
                                  </div>
                                  <div className="col-span-4 sm:col-span-2">
                                    <Input
                                      id={`quantity-${item.id}`}
                                      value={item.quantity}
                                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                      placeholder="Qty"
                                      type="number"
                                      min="1"
                                      step="1"
                                      className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                                      required
                                    />
                                  </div>
                                  <div className="col-span-4 sm:col-span-2">
                                    <Input
                                      id={`unitPrice-${item.id}`}
                                      value={item.unitPrice}
                                      onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                                      placeholder="Price"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="border-amber-800/30 bg-amber-950/30 text-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                                      required
                                    />
                                  </div>
                                  <div className="col-span-3 sm:col-span-2">
                                    <Input
                                      id={`total-${item.id}`}
                                      value={item.total}
                                      readOnly
                                      placeholder="0.00"
                                      className="bg-amber-950/50 text-amber-300 font-medium border-amber-800/30"
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-center">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(item.id)}
                                        disabled={items.length === 1}
                                        className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors duration-200"
                                        title="Remove item"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          <motion.div
                            className="bg-amber-950/50 p-3 flex justify-end"
                            animate={{
                              backgroundColor: items.length > 1 ? "rgba(120, 53, 15, 0.3)" : "rgba(146, 64, 14, 0.3)",
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="w-full max-w-[200px]">
                              <Label className="text-sm font-medium text-amber-200">Grand Total (PKR)</Label>
                              <Input
                                value={calculateTotal()}
                                readOnly
                                className="font-bold text-lg bg-black/30 border-amber-800/30 text-amber-300"
                              />
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <HoverBorderGradient
                            as="button"
                            onClick={() => setActiveTab("customer")}
                            className="px-4 py-2 bg-black rounded-xl text-amber-200 font-medium transition-all duration-300 flex items-center gap-1"
                            containerClassName="rounded-xl"
                            duration={2000}
                            backgroundClassName="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20"
                            borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Customer Details
                          </HoverBorderGradient>
                        </div>
                      </CardContent>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>

            <CardFooter className="flex flex-wrap gap-2 justify-end bg-gradient-to-r from-amber-950/30 to-yellow-950/30 border-t border-amber-800/20 py-4">
              <HoverBorderGradient
                as="button"
                onClick={saveQuotation}
                disabled={!isFormValid()}
                className={cn(
                  "px-4 py-2 bg-black rounded-xl text-amber-200 font-medium transition-all duration-300 flex items-center gap-1",
                  !isFormValid() && "opacity-50 cursor-not-allowed",
                )}
                containerClassName="rounded-xl"
                duration={2000}
                backgroundClassName="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20"
                borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
              >
                <Save className="h-4 w-4" /> Save Draft
              </HoverBorderGradient>

              <HoverBorderGradient
                as="button"
                onClick={generatePDF}
                disabled={!isFormValid() || isGenerating}
                className={cn(
                  "px-4 py-2 bg-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium transition-all duration-300 flex items-center gap-1",
                  (!isFormValid() || isGenerating) && "opacity-50 cursor-not-allowed",
                )}
                containerClassName="rounded-xl"
                duration={2000}
                backgroundClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" /> Generate PDF
                  </>
                )}
              </HoverBorderGradient>
            </CardFooter>

            {/* Hidden PDF generator component that only renders when needed */}
            {showPdfGenerator && (
              <div style={{ display: "none" }}>
                <PDFGenerator
                  customerName={customerName}
                  customerAddress={customerAddress}
                  customerPhone={customerPhone}
                  customerEmail={customerEmail}
                  date={date}
                  validUntil={validUntil}
                  items={items}
                  total={calculateTotal()}
                  notes={notes}
                  onComplete={handlePdfGenerationComplete}
                />
              </div>
            )}
          </Card>
        </div>
      </motion.div>

      {/* Success Dialog */}
      <AnimatePresence>
        {showSuccessDialog && (
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-md bg-black/80 border border-amber-800/30 text-amber-100 backdrop-blur-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center text-amber-300">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-amber-400" />
                    PDF Generated Successfully
                  </DialogTitle>
                  <DialogDescription className="text-amber-200/70">
                    Your quotation PDF has been created and downloaded successfully.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-900/30 to-yellow-900/30 flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,amber_360deg)] animate-spin-slow opacity-70"></div>
                    <div className="absolute inset-[2px] rounded-full bg-black flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-amber-400" />
                    </div>
                  </motion.div>
                </div>
                <DialogFooter className="sm:justify-center">
                  <HoverBorderGradient
                    as="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium transition-all duration-300 flex items-center gap-1"
                    containerClassName="rounded-xl"
                    duration={2000}
                    backgroundClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                    borderClassName="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                  >
                    <RefreshCw className="h-4 w-4" /> Create New Quotation
                  </HoverBorderGradient>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
