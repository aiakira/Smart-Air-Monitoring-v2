"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [thresholds, setThresholds] = useState<any>({
    threshold_co2_good: 700,
    threshold_co2_poor: 1000,
    threshold_co_double: 2,
    threshold_co_poor: 5,
    threshold_dust_moderate: 75,
    threshold_dust_poor: 100,
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/settings')
        const json = await res.json()
        if (!mounted) return
        if (json?.data) {
          setMode(json.data.mode === 'manual' ? 'manual' : 'auto')
          setThresholds({
            threshold_co2_good: json.data.threshold_co2_good ?? 700,
            threshold_co2_poor: json.data.threshold_co2_poor ?? 1000,
            threshold_co_double: json.data.threshold_co_double ?? 2,
            threshold_co_poor: json.data.threshold_co_poor ?? 5,
            threshold_dust_moderate: json.data.threshold_dust_moderate ?? 75,
            threshold_dust_poor: json.data.threshold_dust_poor ?? 100,
          })
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleChange = (key: string, value: string) => {
    setThresholds((s: any) => ({ ...s, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ...Object.fromEntries(Object.entries(thresholds).map(([k,v])=>[k, Number(v)])) }),
      })
      alert('Pengaturan disimpan')
    } catch (e) {
      alert('Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Pengaturan</h1>
              <p className="text-muted-foreground">Atur ambang batas kualitas udara dan mode operasi</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mode Operasi</label>
                  <div className="flex gap-2">
                    <button className={`px-3 py-2 rounded ${mode==='auto'?'bg-primary text-white':'bg-transparent border'}`} onClick={()=>setMode('auto')}>Auto</button>
                    <button className={`px-3 py-2 rounded ${mode==='manual'?'bg-primary text-white':'bg-transparent border'}`} onClick={()=>setMode('manual')}>Manual</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm">CO₂ (Baik)</label>
                    <Input value={String(thresholds.threshold_co2_good)} onChange={(e)=>handleChange('threshold_co2_good', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">CO₂ (Buruk)</label>
                    <Input value={String(thresholds.threshold_co2_poor)} onChange={(e)=>handleChange('threshold_co2_poor', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">CO (Baik)</label>
                    <Input value={String(thresholds.threshold_co_double)} onChange={(e)=>handleChange('threshold_co_double', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">CO (Buruk)</label>
                    <Input value={String(thresholds.threshold_co_poor)} onChange={(e)=>handleChange('threshold_co_poor', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">Debu (Sedang)</label>
                    <Input value={String(thresholds.threshold_dust_moderate)} onChange={(e)=>handleChange('threshold_dust_moderate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">Debu (Buruk)</label>
                    <Input value={String(thresholds.threshold_dust_poor)} onChange={(e)=>handleChange('threshold_dust_poor', e.target.value)} />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={loading}>{loading?'Menyimpan...':'Simpan Pengaturan'}</Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
