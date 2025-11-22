"use client"

import { Card } from "@/components/ui/card"

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* About Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              💨 Tentang Aplikasi
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart Air Monitor adalah sistem monitoring kualitas udara real-time yang memantau kadar CO₂, CO, dan debu di lingkungan Anda untuk menjaga kualitas udara tetap optimal.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              🌫️ Bahaya CO₂
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kadar CO₂ tinggi dapat menyebabkan sakit kepala, pusing, dan menurunkan konsentrasi. 
              <span className="block mt-2">
                • Normal: &lt;700 ppm<br/>
                • Sedang: 700-1000 ppm<br/>
                • Buruk: &gt;1000 ppm
              </span>
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              🏭 Bahaya Debu & CO
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Partikel debu (PM) dapat masuk ke paru-paru dan menyebabkan gangguan pernapasan. 
              CO (karbon monoksida) sangat berbahaya karena mengikat oksigen dalam darah.
              <span className="block mt-2 text-xs">
                Selalu jaga ventilasi ruangan yang baik!
              </span>
            </p>
          </Card>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 Smart Air Monitor. Sistem monitoring kualitas udara untuk lingkungan yang lebih sehat.
          </p>
        </div>
      </div>
    </footer>
  )
}
