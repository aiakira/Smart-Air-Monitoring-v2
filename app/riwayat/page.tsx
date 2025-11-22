"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown, Trash2, Calendar } from "lucide-react"

export default function RiwayatPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"semua" | "baik" | "sedang" | "buruk">("semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"semua" | "hari-ini" | "minggu-ini" | "bulan-ini">("semua")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<"tanggal" | "co2" | "co" | "dust" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sensor/history?limit=100')
      const json = await res.json()
      if (json?.data) {
        const rows = json.data.map((row: any, idx: number) => {
          const d = new Date(row.ts)
          return {
            id: idx,
            tanggal: d.toLocaleDateString('id-ID'),
            waktu: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
            co2: row.co2,
            co: row.co,
            dust: row.dust,
            status: row.co2 > 1000 ? 'buruk' : row.co2 > 700 ? 'sedang' : 'baik',
          }
        })
        setData(rows)
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Filtered data
  const filteredData = useMemo(() => {
    let result = data

    if (filterStatus !== "semua") {
      result = result.filter((item) => item.status === filterStatus)
    }

    if (dateFilter !== "semua") {
      const now = new Date()
      result = result.filter((item) => {
        const itemDate = new Date(item.tanggal.split('/').reverse().join('-'))
        if (dateFilter === "hari-ini") {
          return itemDate.toDateString() === now.toDateString()
        } else if (dateFilter === "minggu-ini") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return itemDate >= weekAgo
        } else if (dateFilter === "bulan-ini") {
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
        }
        return true
      })
    }

    if (startDate || endDate) {
      result = result.filter((item) => {
        const itemDate = new Date(item.tanggal.split('/').reverse().join('-'))
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()
        return itemDate >= start && itemDate <= end
      })
    }

    if (searchQuery) {
      result = result.filter((item) => 
        item.tanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.waktu.includes(searchQuery) ||
        item.co2.toString().includes(searchQuery) ||
        item.co.toString().includes(searchQuery) ||
        item.dust.toString().includes(searchQuery) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortColumn]
        let bVal = b[sortColumn]
        if (sortColumn === "tanggal") {
          aVal = new Date(a.tanggal.split('/').reverse().join('-')).getTime()
          bVal = new Date(b.tanggal.split('/').reverse().join('-')).getTime()
        }
        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }

    return result
  }, [data, filterStatus, searchQuery, dateFilter, startDate, endDate, sortColumn, sortDirection])

  // Statistics
  const statistics = useMemo(() => {
    if (filteredData.length === 0) return null
    const co2Values = filteredData.map(d => d.co2)
    const coValues = filteredData.map(d => d.co)
    const dustValues = filteredData.map(d => d.dust)
    return {
      avgCO2: (co2Values.reduce((a, b) => a + b, 0) / co2Values.length).toFixed(1),
      maxCO2: Math.max(...co2Values),
      minCO2: Math.min(...co2Values),
      avgCO: (coValues.reduce((a, b) => a + b, 0) / coValues.length).toFixed(2),
      avgDust: (dustValues.reduce((a, b) => a + b, 0) / dustValues.length).toFixed(1),
      statusCount: {
        baik: filteredData.filter(d => d.status === 'baik').length,
        sedang: filteredData.filter(d => d.status === 'sedang').length,
        buruk: filteredData.filter(d => d.status === 'buruk').length,
      }
    }
  }, [filteredData])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleSort = (column: "tanggal" | "co2" | "co" | "dust") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedData.map(d => d.id))
    }
  }

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleExportCSV = (selectedOnly = false) => {
    const dataToExport = selectedOnly ? filteredData.filter(d => selectedRows.includes(d.id)) : filteredData
    const csv = [
      ["Tanggal", "Waktu", "CO₂ (ppm)", "CO (ppm)", "Debu (µg/m³)", "Status"].join(","),
      ...dataToExport.map((row) => [row.tanggal, row.waktu, row.co2, row.co, row.dust, row.status].join(",")),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `air-quality-history-${new Date().toISOString()}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "baik": return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
      case "sedang": return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
      case "buruk": return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
      default: return "bg-gray-100 text-gray-900"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Riwayat Data</h1>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString('id-ID')}
                  {autoRefresh && <span className="ml-2 text-primary">● Auto-refresh aktif</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Auto Refresh
                </Button>
                <Button size="sm" variant="outline" onClick={() => fetchData()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Rata-rata CO₂</div>
                  <div className="text-2xl font-bold">{statistics.avgCO2} <span className="text-sm font-normal">ppm</span></div>
                  <div className="text-xs text-muted-foreground mt-1">Min: {statistics.minCO2} | Max: {statistics.maxCO2}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Rata-rata CO</div>
                  <div className="text-2xl font-bold">{statistics.avgCO} <span className="text-sm font-normal">ppm</span></div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Rata-rata Debu</div>
                  <div className="text-2xl font-bold">{statistics.avgDust} <span className="text-sm font-normal">µg/m³</span></div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Status Kualitas</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-900">🟢 {statistics.statusCount.baik}</span>
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-900">🟡 {statistics.statusCount.sedang}</span>
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-900">🔴 {statistics.statusCount.buruk}</span>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="p-6 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")}>Clear</Button>
                )}
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-wrap gap-2 items-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground"
                />
                <span className="text-sm text-muted-foreground">sampai</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground"
                />
                {(startDate || endDate) && (
                  <Button size="sm" variant="ghost" onClick={() => { setStartDate(""); setEndDate("") }}>Clear</Button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium">Status:</span>
                  {["semua", "baik", "sedang", "buruk"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status as any)}
                    >
                      {status === "semua" ? "Semua" : status === "baik" ? "🟢 Baik" : status === "sedang" ? "🟡 Sedang" : "🔴 Buruk"}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium">Periode:</span>
                  {["semua", "hari-ini", "minggu-ini", "bulan-ini"].map((period) => (
                    <Button
                      key={period}
                      variant={dateFilter === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDateFilter(period as any)}
                    >
                      {period === "semua" ? "Semua" : period === "hari-ini" ? "Hari Ini" : period === "minggu-ini" ? "Minggu Ini" : "Bulan Ini"}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <Card className="p-4 bg-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{selectedRows.length} baris dipilih</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExportCSV(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setSelectedRows([])}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Table */}
            <Card className="shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground mb-2">Tidak ada data</p>
                  <p className="text-sm text-muted-foreground">Coba ubah filter atau tambahkan data baru</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                              onChange={handleSelectAll}
                              className="rounded"
                            />
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("tanggal")}>
                            <div className="flex items-center gap-2">
                              Tanggal/Waktu
                              {sortColumn === "tanggal" && <ArrowUpDown className="h-4 w-4" />}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("co2")}>
                            <div className="flex items-center gap-2">
                              CO₂ (ppm)
                              {sortColumn === "co2" && <ArrowUpDown className="h-4 w-4" />}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("co")}>
                            <div className="flex items-center gap-2">
                              CO (ppm)
                              {sortColumn === "co" && <ArrowUpDown className="h-4 w-4" />}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("dust")}>
                            <div className="flex items-center gap-2">
                              Debu (µg/m³)
                              {sortColumn === "dust" && <ArrowUpDown className="h-4 w-4" />}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginatedData.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(row.id)}
                                onChange={() => handleSelectRow(row.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-6 py-3 text-sm">
                              {row.tanggal} <span className="text-muted-foreground">{row.waktu}</span>
                            </td>
                            <td className="px-6 py-3 font-medium">{row.co2}</td>
                            <td className="px-6 py-3 font-medium">{row.co}</td>
                            <td className="px-6 py-3 font-medium">{row.dust}</td>
                            <td className="px-6 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="border-t border-border p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                        className="px-2 py-1 border border-border rounded text-sm bg-card"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-muted-foreground ml-4">
                        {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Export Button */}
            <div className="flex justify-end">
              <Button onClick={() => handleExportCSV(false)}>
                <Download className="h-4 w-4 mr-2" />
                Export All to CSV
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
