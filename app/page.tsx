import QuotationForm from "@/components/quotation-form"
import { Poppins } from "next/font/google"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { SparklesCore } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
})

export default function Home() {
  return (
    <main className={`min-h-screen bg-black/[0.96] antialiased ${poppins.className} overflow-hidden relative`}>
      <BackgroundBeams className="from-amber-200/30 via-yellow-300/30 to-amber-500/30" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center mb-12 mt-8">
          <div className="w-[40rem] h-40 relative">
            <SparklesCore
              id="tsparticles"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#f59e0b"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                MA Solar Energy
              </h1>
            </div>
          </div>

          <div className="text-center max-w-md text-amber-100/80 mt-2">
            <TextGenerateEffect words="Professional Solar Installation Quotation Generator" />
          </div>
        </div>

        <QuotationForm />
      </div>
    </main>
  )
}
