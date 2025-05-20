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
      >
        <Card className="w-full shadow-2xl border-t-4 border-t-amber-500 rounded-xl overflow-hidden bg-white backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
            <CardTitle className="flex items-center text-amber-800 text-xl">
              <FileDown className="h-5 w-5 mr-2 text-amber-600" />
              Create Professional Quotation
            </CardTitle>
          </CardHeader>

          <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/50">
              <TabsTrigger
                value="customer"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-900 transition-all duration-200"
              >
                Customer Details
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-900 transition-all duration-200"
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
                            className="text-sm font-medium flex items-center text-amber-800"
                          >
                            Customer Name*
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 ml-1 text-amber-600/70" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-amber-900 text-white">
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
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerPhone" className="text-sm font-medium text-amber-800">
                            Customer Phone
                          </Label>
                          <Input
                            id="customerPhone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Enter customer phone"
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerEmail" className="text-sm font-medium text-amber-800">
                            Customer Email
                          </Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="Enter customer email"
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerAddress" className="text-sm font-medium text-amber-800">
                            Customer Address
                          </Label>
                          <Input
                            id="customerAddress"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Enter customer address"
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-sm font-medium text-amber-800">
                            Quotation Date
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="validUntil" className="text-sm font-medium text-amber-800">
                            Valid Until
                          </Label>
                          <Input
                            id="validUntil"
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <Label htmlFor="notes" className="text-sm font-medium text-amber-800">
                            Notes
                          </Label>
                          <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes for the quotation"
                            className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => setActiveTab("items")}
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white group transition-all duration-300 shadow-md hover:shadow-lg shadow-amber-200"
                          >
                            Continue to Items
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </motion.div>
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
                        <h3 className="text-lg font-medium text-amber-800 flex items-center">
                          <Sun className="h-5 w-5 mr-2 text-amber-500" /> Quotation Items
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addNewRow}
                              className="flex items-center gap-1 border-amber-200 hover:bg-amber-50 text-amber-700 transition-all duration-200"
                              onMouseEnter={() => setIsHoveringAdd(true)}
                              onMouseLeave={() => setIsHoveringAdd(false)}
                            >
                              <Plus
                                className={`h-4 w-4 transition-transform duration-300 ${
                                  isHoveringAdd ? "rotate-90" : ""
                                }`}
                              />{" "}
                              Add Empty Row
                            </Button>
                          </motion.div>

                          <div className="relative group">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 border-amber-200 hover:bg-amber-50 text-amber-700 transition-all duration-200"
                              >
                                <Sparkles className="h-4 w-4 text-amber-500" /> Quick Add Item
                              </Button>
                            </motion.div>
                            <div className="absolute right-0 mt-1 w-64 bg-white shadow-xl rounded-md border border-amber-100 p-2 hidden group-hover:block z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                              <div className="text-xs font-medium text-amber-600 mb-1 px-2">Common Solar Items</div>
                              {commonItems.map((item, index) => (
                                <motion.button
                                  key={index}
                                  onClick={() => addCommonItem(item)}
                                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-amber-50 rounded transition-colors duration-150"
                                  whileHover={{ x: 2 }}
                                >
                                  {item.description} - ₨{item.unitPrice}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden border-amber-100 shadow-sm">
                        <div className="grid grid-cols-12 gap-2 bg-amber-50 p-3 border-b border-amber-100 text-xs font-medium text-amber-800">
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
                                className="grid grid-cols-12 gap-2 p-3 border-b border-amber-50 hover:bg-amber-50/30 transition-colors items-end"
                              >
                                <div className="col-span-12 sm:col-span-5">
                                  <Input
                                    id={`description-${item.id}`}
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                    placeholder="Item description"
                                    className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
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
                                    className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
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
                                    className="border-amber-100 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 transition-all duration-200"
                                    required
                                  />
                                </div>
                                <div className="col-span-3 sm:col-span-2">
                                  <Input
                                    id={`total-${item.id}`}
                                    value={item.total}
                                    readOnly
                                    placeholder="0.00"
                                    className="bg-amber-50/50 font-medium"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeRow(item.id)}
                                      disabled={items.length === 1}
                                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
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
                          className="bg-amber-50 p-3 flex justify-end"
                          animate={{ backgroundColor: items.length > 1 ? "rgb(254 243 199)" : "rgb(254 252 232)" }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="w-full max-w-[200px]">
                            <Label className="text-sm font-medium text-amber-800">Grand Total (PKR)</Label>
                            <Input
                              value={calculateTotal()}
                              readOnly
                              className="font-bold text-lg bg-white border-amber-200 shadow-sm"
                            />
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("customer")}
                            className="border-amber-200 hover:bg-amber-50 text-amber-700 group transition-all duration-300"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Customer Details
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>

          <CardFooter className="flex flex-wrap gap-2 justify-end bg-gradient-to-r from-amber-50 to-yellow-50 border-t py-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                onClick={saveQuotation}
                className="flex items-center gap-2 border-amber-200 hover:bg-amber-50 text-amber-700 transition-all duration-300 shadow-sm"
                disabled={!isFormValid()}
              >
                <Save className="h-4 w-4" /> Save Draft
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white transition-all duration-300 shadow-md hover:shadow-lg shadow-amber-200"
                disabled={!isFormValid() || isGenerating}
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
              </Button>
            </motion.div>
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
      </motion.div>

      {/* Success Dialog */}
      <AnimatePresence>
        {showSuccessDialog && (
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center text-amber-700">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-amber-500" />
                    PDF Generated Successfully
                  </DialogTitle>
                  <DialogDescription>
                    Your quotation PDF has been created and downloaded successfully.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-amber-500" />
                  </motion.div>
                </div>
                <DialogFooter className="sm:justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="default"
                      onClick={resetForm}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 flex items-center gap-2 transition-all duration-300 shadow-md"
                    >
                      <RefreshCw className="h-4 w-4" /> Create New Quotation
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
