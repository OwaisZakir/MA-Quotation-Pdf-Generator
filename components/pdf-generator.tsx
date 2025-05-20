"use client"

import { useEffect } from "react"

interface QuotationItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  total: string
}

interface PDFGeneratorProps {
  customerName: string
  customerAddress: string
  customerPhone: string
  customerEmail: string
  date: string
  validUntil: string
  items: QuotationItem[]
  total: string
  notes: string
  onComplete: (success: boolean) => void
}

export default function PDFGenerator({
  customerName,
  customerAddress,
  customerPhone,
  customerEmail,
  date,
  validUntil,
  items,
  total,
  notes,
  onComplete,
}: PDFGeneratorProps) {
  useEffect(() => {
    // Pre-load the scripts when the component mounts
    const preloadScripts = () => {
      const jspdfLink = document.createElement("link")
      jspdfLink.rel = "preload"
      jspdfLink.href = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      jspdfLink.as = "script"

      const autotableLink = document.createElement("link")
      autotableLink.rel = "preload"
      autotableLink.href = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"
      autotableLink.as = "script"

      document.head.appendChild(jspdfLink)
      document.head.appendChild(autotableLink)
    }

    preloadScripts()

    const generatePDF = async () => {
      try {
        // Check if scripts are already loaded
        if (window.jspdf) {
          createPDF()
          return
        }

        // Create script elements
        const script1 = document.createElement("script")
        script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        script1.async = false

        const script2 = document.createElement("script")
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"
        script2.async = false

        // Add scripts to document
        document.body.appendChild(script1)

        // Wait for first script to load before adding the second
        script1.onload = () => {
          document.body.appendChild(script2)

          // Wait for second script to load
          script2.onload = () => {
            // Small delay to ensure everything is initialized
            setTimeout(() => {
              createPDF()
            }, 100)
          }

          script2.onerror = () => {
            console.error("Error loading autotable script")
            onComplete(false)
          }
        }

        script1.onerror = () => {
          console.error("Error loading jsPDF script")
          onComplete(false)
        }
      } catch (error) {
        console.error("PDF generation outer error:", error)
        onComplete(false)
      }
    }

    const createPDF = () => {
      try {
        // Access the global jsPDF constructor
        // @ts-ignore - jspdf is loaded globally
        const { jsPDF } = window.jspdf

        // Create the document
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        // Set document properties
        doc.setProperties({
          title: `MA Solar Energy Quotation - ${customerName}`,
          subject: "Solar Installation Quotation",
          author: "MA Solar Energy",
          keywords: "quotation, solar, energy",
          creator: "MA Solar Energy Quotation Generator",
        })

        // Define colors
        const primaryColor = [245, 158, 11] // Amber-500
        const secondaryColor = [234, 179, 8] // Yellow-500
        const lightGray = [240, 240, 240]
        const darkGray = [80, 80, 80]

        // Add clean header
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, 210, 40, "F")

        // Add company name and tagline
        doc.setTextColor(...primaryColor)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("MA SOLAR ENERGY", 105, 20, { align: "center" })

        doc.setTextColor(...darkGray)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Professional Solar Installation Services", 105, 26, { align: "center" })

        // Add contact information
        doc.setFontSize(8)
        doc.text("Zakir Aleem | Call: 03132532601 | WhatsApp: 03462505849", 105, 32, { align: "center" })

        // Add horizontal line
        doc.setDrawColor(...lightGray)
        doc.setLineWidth(0.5)
        doc.line(14, 40, 196, 40)

        // Add quotation title
        doc.setFillColor(...lightGray)
        doc.rect(0, 45, 210, 10, "F")
        doc.setTextColor(...primaryColor)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("QUOTATION", 105, 52, { align: "center" })

        // Add quotation details
        doc.setTextColor(...darkGray)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Quotation Details", 14, 65)

        doc.setDrawColor(...lightGray)
        doc.setLineWidth(0.5)
        doc.line(14, 67, 90, 67)

        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Date: ${date}`, 14, 73)
        doc.text(`Valid Until: ${validUntil}`, 14, 78)
        doc.text(`Reference: QT-${Date.now().toString().substring(6)}`, 14, 83)

        // Add customer details
        doc.setTextColor(...darkGray)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Customer Information", 120, 65)

        doc.setDrawColor(...lightGray)
        doc.setLineWidth(0.5)
        doc.line(120, 67, 196, 67)

        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Name: ${customerName}`, 120, 73)
        doc.text(`Phone: ${customerPhone}`, 120, 78)
        doc.text(`Email: ${customerEmail}`, 120, 83)
        doc.text(`Address: ${customerAddress}`, 120, 88)

        // Add items table with improved styling
        const tableColumn = ["Description", "Quantity", "Unit Price (PKR)", "Total (PKR)"]

        const tableRows = items.map((item) => [item.description, item.quantity, item.unitPrice, item.total])

        // Add a row for the grand total
        tableRows.push(["", "", "Grand Total:", total])

        // Use autoTable with better styling
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 95,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 20, halign: "center" },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 30, halign: "right" },
          },
          alternateRowStyles: {
            fillColor: [254, 252, 232], // Yellow-50
          },
          footStyles: {
            fillColor: [254, 243, 199], // Amber-100
            textColor: primaryColor,
            fontStyle: "bold",
            halign: "right",
          },
        })

        // Get the final Y position after the table
        const finalY = (doc as any).lastAutoTable.finalY || 150

        // Add notes section
        if (notes) {
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(...darkGray)
          doc.text("Notes:", 14, finalY + 10)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.text(notes, 14, finalY + 16)
        }

        // Add terms and conditions with better formatting
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...darkGray)
        doc.text("Terms and Conditions:", 14, finalY + 30)

        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        const terms = [
          "1. Prices are valid for 15 days from the date of quotation.",
          "2. 50% advance payment required to start work.",
          "3. Warranty as per manufacturer's terms and conditions.",
          "4. Installation timeline will be provided after site inspection.",
          "5. Prices may vary based on site conditions and requirements.",
          "6. Final system performance depends on actual solar irradiance.",
        ]

        terms.forEach((term, index) => {
          doc.text(term, 14, finalY + 36 + index * 5)
        })

        // Add signature section
        doc.setDrawColor(...darkGray)
        doc.setLineWidth(0.2)
        doc.line(14, finalY + 70, 80, finalY + 70)
        doc.line(120, finalY + 70, 186, finalY + 70)

        doc.setFontSize(8)
        doc.text("Authorized Signature", 47, finalY + 75, { align: "center" })
        doc.text("Customer Signature", 153, finalY + 75, { align: "center" })

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)

          // Add colored footer
          doc.setFillColor(...lightGray)
          doc.rect(0, 287, 210, 10, "F")

          doc.setFontSize(8)
          doc.setTextColor(...darkGray)
          doc.text("Thank you for choosing MA Solar Energy!", 105, 292, { align: "center" })

          // Add page number
          doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: "right" })
        }

        // Save the PDF with a better filename
        const cleanName = customerName.replace(/[^a-zA-Z0-9]/g, "_")
        doc.save(`MA_Solar_Quotation_${cleanName}_${date}.pdf`)

        // Signal completion
        onComplete(true)
      } catch (error) {
        console.error("PDF creation error:", error)
        onComplete(false)
      }
    }

    // Start the PDF generation process
    generatePDF()

    // Cleanup function
    return () => {
      // Remove any scripts that might have been added
      const scripts = document.querySelectorAll('script[src*="jspdf"]')
      scripts.forEach((script) => script.remove())

      // Remove preload links
      const links = document.querySelectorAll('link[href*="jspdf"]')
      links.forEach((link) => link.remove())
    }
  }, [customerName, customerAddress, customerPhone, customerEmail, date, validUntil, items, total, notes, onComplete])

  return null
}
