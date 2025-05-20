import QuotationForm from "@/components/quotation-form"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
})

export default function Home() {
  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-white ${poppins.className} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[url('/sun-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 animate-pulse-slow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 bg-clip-text text-transparent drop-shadow-sm animate-fade-in-up">
            MA Solar Energy
          </h1>
          <p className="text-amber-800/70 mt-2 text-center max-w-md animate-fade-in-up animation-delay-100 font-light tracking-wide">
            Professional Solar Installation Quotation Generator
          </p>
        </div>
        <QuotationForm />
      </div>
    </main>
  )
}
