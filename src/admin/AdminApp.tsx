// PayTaksi · Admin paneli iskeleti
// Ana sitenin tasarım dilini (palet, font, cam kartlar, sekme çubuğu) kullanır.
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16,17,20,0.09)",
    accent: "#3A3AF4",
    glass: "rgba(252,251,248,0.74)",
}
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

// ---------- ikonlar (ana sitedeki sekme ikon stiliyle aynı: 24px, 1.5 çizgi) ----------
const ICONS: Record<string, string> = {
    analytics: "M4 19h16M7 16v-4M12 16V9M17 16V6M7 9l5-3 5-2",
    rides: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5",
    passengers: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16.5 5a2.5 2.5 0 1 1 0 5M21 20c0-2.5-1.6-4.7-4-5.4",
    drivers: "M4 13l1.8-4.5A2 2 0 0 1 7.7 7h8.6a2 2 0 0 1 1.9 1.5L20 13M3 13h18v5h-2v-1H5v1H3v-5zM9.5 4h5v3h-5zM7 15.5h.01M17 15.5h.01",
    finance: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM15.5 11.5h4.5v3h-4.5a1.5 1.5 0 0 1 0-3zM7 9h5",
}

type TabKey = "analytics" | "rides" | "passengers" | "drivers" | "finance"
const TABS: { key: TabKey; label: string; path: string }[] = [
    { key: "analytics", label: "Analitik", path: "/admin/analitik" },
    { key: "rides", label: "Yolculuklar", path: "/admin/yolculuklar" },
    { key: "passengers", label: "Yolcular", path: "/admin/yolcular" },
    { key: "drivers", label: "Sürücüler", path: "/admin/suruculer" },
    { key: "finance", label: "Finans", path: "/admin/finans" },
]

// ---------- huni (funnel) verisi ----------
const FUNNEL_STEPS = [
    { label: "Ana Sayfa Ziyaret", count: 1840, pct: 100, drop: "—", note: "İlk giriş" },
    { label: "Nereden / Nereye Butonu", count: 1190, pct: 64.7, drop: "-650 (%35,3)", note: "Konum seçimi" },
    { label: "Taksi Çağır Butonu", count: 612, pct: 33.3, drop: "-578 (%48,6)", note: "Fiyat gördü, çağırdı" },
    { label: "Ödeme Ekranı Açıldı", count: 495, pct: 26.9, drop: "-117 (%19,1)", note: "Modal görüntülendi" },
    { label: "Giriş Yap / Cüzdan", count: 162, pct: 8.8, drop: "—", note: "Ödeme tercihi" },
    { label: "Nakitle Devam Et", count: 124, pct: 6.7, drop: "—", note: "Ödeme tercihi" },
    { label: "Çağrı Tamamlandı", count: 248, pct: 13.5, drop: "-247 (%49,9)", note: "Ödeme ekranından çıkış" },
]

// ---------- örnek (placeholder) veri ----------
const PAGES: Record<
    TabKey,
    {
        title: string
        sub: string
        stats: { label: string; value: string; hint: string }[]
        columns: string[]
        rows: string[][]
    }
> = {
    analytics: {
        title: "Kullanıcı Akışı & Tıklamalar",
        sub: "Ziyaretçilerin hangi adımda kaldığı ve nereden çıkış yaptığı",
        stats: [
            { label: "Ana Sayfa", value: "1.840", hint: "bugün ziyaret" },
            { label: "Taksi Çağır", value: "612", hint: "%33,3 tıklama" },
            { label: "En Çok Çıkış", value: "Ödeme", hint: "%49,9 terk" },
            { label: "Tamamlanan", value: "248", hint: "%13,5 dönüşüm" },
        ],
        columns: ["Adım / Buton", "Tıklama", "Toplam Oran", "Ayrılan (Terk)", "Durum"],
        rows: [
            ["Ana Sayfa Görüntüleme", "1.840", "%100", "—", "Aktif"],
            ["Nereden / Nereye Butonu", "1.190", "%64,7", "650 kişi", "Aktif"],
            ["Taksi Çağır Butonu", "612", "%33,3", "578 kişi", "Yüksek Terk"],
            ["Giriş Yap / Cüzdan", "162", "%8,8", "—", "Aktif"],
            ["Nakitle Devam Et", "124", "%6,7", "—", "Aktif"],
            ["Ödeme Ekranı Terk", "247", "%13,4", "247 kişi", "İptal"],
        ],
    },
    rides: {
        title: "Yolculuklar",
        sub: "Anlık ve geçmiş tüm taksi çağrıları",
        stats: [
            { label: "Bugün", value: "128", hint: "+12% dün" },
            { label: "Aktif", value: "9", hint: "şu an yolda" },
            { label: "İptal", value: "4", hint: "%3,1" },
            { label: "Ort. süre", value: "14 dk", hint: "merkez" },
        ],
        columns: ["No", "Güzergah", "Sürücü", "Tutar", "Durum"],
        rows: [
            ["#1042", "Fırat Üniv. → Otogar", "Mehmet K.", "₺220", "Yolda"],
            ["#1041", "Elysium AVM → Park 23", "Ali T.", "₺180", "Tamamlandı"],
            ["#1040", "Havalimanı → Merkez", "Hasan Y.", "₺450", "Tamamlandı"],
            ["#1039", "Harput → Otogar", "—", "₺260", "İptal"],
        ],
    },
    passengers: {
        title: "Yolcular",
        sub: "Kayıtlı yolcu hesapları",
        stats: [
            { label: "Toplam", value: "3.482", hint: "kayıtlı" },
            { label: "Yeni (7g)", value: "126", hint: "+8%" },
            { label: "Aktif", value: "812", hint: "son 30 gün" },
            { label: "Engelli", value: "6", hint: "" },
        ],
        columns: ["Ad Soyad", "E-posta", "Yolculuk", "Kayıt", "Durum"],
        rows: [
            ["Ayşe Demir", "ayse@mail.com", "24", "02.11.2026", "Aktif"],
            ["Can Yıldız", "can@mail.com", "3", "15.11.2026", "Aktif"],
            ["Zeynep Kaya", "zeynep@mail.com", "0", "18.11.2026", "Yeni"],
        ],
    },
    drivers: {
        title: "Sürücüler",
        sub: "Taksici hesapları ve onay durumları",
        stats: [
            { label: "Toplam", value: "214", hint: "sürücü" },
            { label: "Çevrimiçi", value: "63", hint: "şu an" },
            { label: "Onay bekleyen", value: "5", hint: "belge kontrolü" },
            { label: "Puan", value: "4,8", hint: "ortalama" },
        ],
        columns: ["Ad Soyad", "Plaka", "Durak", "Puan", "Durum"],
        rows: [
            ["Mehmet Kaya", "23 T 1042", "Merkez", "4,9", "Çevrimiçi"],
            ["Ali Tunç", "23 T 2210", "Üniversite", "4,7", "Çevrimdışı"],
            ["Hasan Yurt", "23 T 0987", "Otogar", "4,8", "Onay bekliyor"],
        ],
    },
    finance: {
        title: "Finans",
        sub: "Ciro, komisyon ve ödemeler",
        stats: [
            { label: "Bugün ciro", value: "₺24.680", hint: "+9%" },
            { label: "Komisyon", value: "₺3.702", hint: "%15" },
            { label: "Bekleyen ödeme", value: "₺8.940", hint: "12 sürücü" },
            { label: "Cüzdan bakiye", value: "₺41.200", hint: "yolcular" },
        ],
        columns: ["Tarih", "Açıklama", "Tür", "Tutar", "Durum"],
        rows: [
            ["19.11.2026", "Sürücü ödemesi · Mehmet K.", "Ödeme", "-₺1.240", "Bekliyor"],
            ["19.11.2026", "Cüzdan yükleme · Ayşe D.", "Gelir", "+₺250", "Tamamlandı"],
            ["18.11.2026", "Komisyon · Günlük", "Gelir", "+₺3.702", "Tamamlandı"],
        ],
    },
}

// ---------- günlük taksi çağrısı grafiği (ay seçilebilir) ----------
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
const YEAR = 2026
const TODAY = new Date(2026, 10, 19) // örnek veri için "bugün"

// örnek (deterministik) günlük çağrı sayısı; gerçek veri API'den gelecek
function callsFor(month: number, day: number): number {
    const d = new Date(YEAR, month, day)
    if (d > TODAY) return 0
    const x = Math.sin((month + 1) * 91.7 + day * 12.9898) * 43758.5453
    const r = x - Math.floor(x)
    const weekend = d.getDay() === 5 || d.getDay() === 6 ? 1.35 : 1
    return Math.round((60 + r * 110) * weekend)
}

// seçilen gün için dönüşüm hunisi (örnek veri: Taksi Çağır tıklaması = günlük çağrı sayısı)
function dayFunnel(month: number, day: number) {
    const calls = callsFor(month, day)
    const k = calls / 612
    const jit = (n: number) => 0.92 + 0.16 * (((Math.sin((month + 1) * 17.3 + day * 5.1 + n * 3.7) * 9301.7) % 1 + 1) % 1)
    const raw = FUNNEL_STEPS.map((s, i) => ({ ...s, count: Math.round(s.count * k * jit(i)) }))
    raw[2].count = calls // Taksi Çağır = o günkü çağrı sayısı
    const visits = Math.max(raw[0].count, 1)
    return raw.map((s, i) => {
        const prev = i >= 1 && i <= 3 ? raw[i - 1].count : 0
        const lost = prev - s.count
        return {
            ...s,
            pct: Math.round((s.count / visits) * 1000) / 10,
            drop: i >= 1 && i <= 3 && prev > 0 && lost > 0 ? `-${lost} (%${((lost / prev) * 100).toFixed(1).replace(".", ",")})` : "—",
        }
    })
}

// seçilen ayın tüm günlerinin toplam dönüşüm hunisi
function monthFunnel(month: number) {
    const days = new Date(YEAR, month + 1, 0).getDate()
    const sums = FUNNEL_STEPS.map((s) => ({ ...s, count: 0 }))
    for (let d = 1; d <= days; d++) {
        const df = dayFunnel(month, d)
        df.forEach((s, i) => {
            sums[i].count += s.count
        })
    }
    const visits = Math.max(sums[0].count, 1)
    return sums.map((s, i) => {
        const prev = i >= 1 && i <= 3 ? sums[i - 1].count : 0
        const lost = prev - s.count
        return {
            ...s,
            pct: Math.round((s.count / visits) * 1000) / 10,
            drop: i >= 1 && i <= 3 && prev > 0 && lost > 0 ? `-${lost} (%${((lost / prev) * 100).toFixed(1).replace(".", ",")})` : "—",
        }
    })
}

function AnalyticsCard({
    badge,
    title,
    subtitle,
    funnel,
    accentBg,
    ctaLabel,
    onCta,
}: {
    badge: string
    title: string
    subtitle: string
    funnel: ReturnType<typeof dayFunnel>
    accentBg?: string
    ctaLabel: string
    onCta: () => void
}) {
    const worst = funnel
        .slice(1, 4)
        .map((s, i) => ({ s, lost: funnel[i].count - s.count }))
        .sort((a, b) => b.lost - a.lost)[0]

    return (
        <div
            style={{
                background: "#FFFFFF",
                borderRadius: 22,
                padding: 22,
                boxShadow: "0 30px 70px -30px rgba(30,28,20,0.35), 0 0 0 1px rgba(16,17,20,0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div>
                {/* Kart başlığı */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink }}>{title}</div>
                        <div style={{ fontSize: 12, color: "#5A5C63", marginTop: 2 }}>{subtitle}</div>
                    </div>
                    <span
                        style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            padding: "4px 9px",
                            borderRadius: 999,
                            background: accentBg ?? "rgba(16,17,20,0.06)",
                            color: accentBg ? "#fff" : C.ink,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {badge}
                    </span>
                </div>

                {/* Büyük özet sayı */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div>
                        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 500, letterSpacing: "-0.04em" }}>
                            {funnel[6].count.toLocaleString("tr-TR")}
                        </span>{" "}
                        <span style={{ fontSize: 13, color: "#5A5C63" }}>tamamlanan çağrı</span>
                    </div>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5, color: C.ink, fontFamily: MONO }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M6 .8l1.5 3.4 3.7.3-2.8 2.4.9 3.6L6 8.6 2.7 10.5l.9-3.6L.8 4.5l3.7-.3z" fill="#101114" />
                        </svg>
                        %{String(funnel[6].pct).replace(".", ",")}
                    </div>
                </div>

                {/* Çerçeveli özet kutu */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        border: "1px solid rgba(16,17,20,0.09)",
                        borderRadius: 14,
                        marginTop: 14,
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "9px 12px" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#5A5C63" }}>
                            Ana Sayfa
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, fontFamily: MONO }}>
                            {funnel[0].count.toLocaleString("tr-TR")}
                        </div>
                    </div>
                    <div style={{ padding: "9px 12px", borderLeft: "1px solid rgba(16,17,20,0.09)" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#5A5C63" }}>
                            Taksi Çağır
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, fontFamily: MONO }}>
                            {funnel[2].count.toLocaleString("tr-TR")}
                        </div>
                    </div>
                    <div style={{ gridColumn: "1 / 3", padding: "9px 12px", borderTop: "1px solid rgba(16,17,20,0.09)", background: "rgba(179,38,30,0.03)" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#5A5C63" }}>
                            En Çok Çıkış Yapılan Adım
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 1 }}>
                            {worst.s.label} ·{" "}
                            <span style={{ color: "#B3261E", fontFamily: MONO }}>
                                {Math.max(0, worst.lost).toLocaleString("tr-TR")} kişi
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ height: 1, background: "rgba(16,17,20,0.09)", margin: "14px 0 8px" }} />

                {/* Adım adım döküm + ince görsel çubuklar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {funnel.slice(0, -1).map((st) => (
                        <div key={st.label}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                    gap: 10,
                                    fontSize: 13.5,
                                    color: "#101114",
                                }}
                            >
                                <span style={{ color: "#5A5C63" }}>{st.label}</span>
                                <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                                    {st.count.toLocaleString("tr-TR")}{" "}
                                    <span style={{ fontSize: 11, color: "#5A5C63" }}>({String(st.pct).replace(".", ",")}%)</span>
                                </span>
                            </div>
                            <div style={{ height: 4, borderRadius: 999, background: "rgba(16,17,20,0.06)", marginTop: 4, overflow: "hidden" }}>
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${Math.max(3, st.pct)}%`,
                                        borderRadius: 999,
                                        background: accentBg ?? C.accent,
                                        opacity: 0.78,
                                        transition: "width 0.35s ease",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ height: 1, background: "rgba(16,17,20,0.09)", margin: "12px 0 0" }} />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 15.5,
                        fontWeight: 600,
                        padding: "11px 0 0",
                        color: "#101114",
                    }}
                >
                    <span>Çağrı Tamamlandı</span>
                    <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                        {funnel[6].count.toLocaleString("tr-TR")} (%{String(funnel[6].pct).replace(".", ",")})
                    </span>
                </div>

                <div
                    style={{
                        marginTop: 10,
                        alignSelf: "flex-start",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0E8A5F",
                        background: "rgba(14, 138, 95, 0.09)",
                        padding: "5px 10px",
                        borderRadius: 999,
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M6 1v10M2 7l4 4 4-4" fill="none" stroke="#0E8A5F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>
                        {funnel[4].count.toLocaleString("tr-TR")} Cüzdan · {funnel[5].count.toLocaleString("tr-TR")} Nakit
                    </span>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    onClick={onCta}
                    style={{
                        marginTop: 16,
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "13px 0px",
                        borderRadius: 14,
                        border: 0,
                        background: accentBg ?? C.accent,
                        color: "#fff",
                        fontFamily: SANS,
                        fontWeight: 600,
                        fontSize: 14.5,
                        cursor: "pointer",
                        boxShadow: accentBg ? "rgba(16, 17, 20, 0.14) 0px 0px 0px 4px" : "rgba(58, 58, 244, 0.18) 0px 0px 0px 4px",
                    }}
                >
                    {ctaLabel}
                </button>
            </div>
        </div>
    )
}

function DailyCalls({
    month,
    setMonth,
    day,
    setDay,
}: {
    month: number
    setMonth: (m: number) => void
    day: number // 0 tabanlı gün indeksi
    setDay: (d: number) => void
}) {
    const days = new Date(YEAR, month + 1, 0).getDate()
    const data = Array.from({ length: days }, (_, i) => callsFor(month, i + 1))
    const max = Math.max(...data, 1)
    const sel = Math.max(0, Math.min(day, days - 1))
    const left = (sel / days) * 100
    const width = (1 / days) * 100
    const center = left + width / 2

    const BAR_H = 56
    const barPx = (v: number) => (v === 0 ? 3 : Math.max(6, (v / max) * BAR_H))

    const barsRef = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)
    const pick = (clientX: number) => {
        const r = barsRef.current!.getBoundingClientRect()
        const i = Math.floor(((clientX - r.left) / r.width) * days)
        setDay(Math.max(0, Math.min(days - 1, i)))
    }

    // alt eksen: 1, 8, 15, 22, 29 (ilkinde ay adı)
    const ticks = [1, 8, 15, 22, 29].filter((d) => d <= days)

    return (
        <div className="ad-card" style={{ marginTop: 16, padding: "18px 20px 14px" }}>
            {/* ay seçici */}
            <div className="ad-tabs" style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 6 }}>
                {MONTHS.map((m, i) => {
                    const on = i === month
                    return (
                        <button
                            key={m}
                            onClick={() => setMonth(i)}
                            className="ss-btn ss-focus"
                            style={{
                                flex: "0 0 auto",
                                border: 0,
                                cursor: "pointer",
                                padding: "6px 12px",
                                borderRadius: 999,
                                fontFamily: SANS,
                                fontSize: 13,
                                fontWeight: 600,
                                background: on ? C.ink : "rgba(16,17,20,0.06)",
                                color: on ? "#fff" : C.ink2,
                            }}
                        >
                            {m}
                        </button>
                    )
                })}
            </div>

            <div style={{ position: "relative", paddingTop: 44, paddingLeft: 8, paddingRight: 8 }}>
                {/* seçili gün balonu */}
                <div
                    style={{
                        position: "absolute",
                        left: `calc(8px + (100% - 16px) * ${center / 100})`,
                        top: 6,
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: C.ink,
                        color: "#fff",
                        pointerEvents: "none",
                        transform: "translateX(-50%)",
                    }}
                >
                    <span style={{ fontFamily: MONO, fontWeight: 500 }}>{data[sel]} çağrı</span>
                    <span style={{ opacity: 0.7 }}>
                        {sel + 1} {MONTHS[month]}
                    </span>
                </div>

                {/* sütunlar + seçili günü çerçeveleyen kutu */}
                <div
                    ref={barsRef}
                    role="slider"
                    aria-label="Gün seç"
                    aria-valuemin={1}
                    aria-valuemax={days}
                    aria-valuenow={sel + 1}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowRight") setDay(Math.min(days - 1, sel + 1))
                        if (e.key === "ArrowLeft") setDay(Math.max(0, sel - 1))
                    }}
                    onPointerDown={(e) => {
                        dragging.current = true
                        e.currentTarget.setPointerCapture(e.pointerId)
                        pick(e.clientX)
                    }}
                    onPointerMove={(e) => {
                        if (dragging.current) pick(e.clientX)
                    }}
                    onPointerUp={() => {
                        dragging.current = false
                    }}
                    onPointerCancel={() => {
                        dragging.current = false
                    }}
                    style={{
                        position: "relative",
                        height: BAR_H,
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 2,
                        touchAction: "none",
                        cursor: "grab",
                        userSelect: "none",
                    }}
                >
                    {data.map((v, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: barPx(v),
                                borderRadius: 3,
                                background: i === sel ? C.accent : "rgba(16,17,20,0.16)",
                                transition: "background .2s, height .35s ease",
                            }}
                        />
                    ))}
                    <div
                        style={{
                            position: "absolute",
                            left: `calc(${left}% - 3px)`,
                            width: `calc(${width}% + 4px)`,
                            top: -6,
                            bottom: -6,
                            borderRadius: 10,
                            border: `1.5px solid ${C.accent}`,
                            background: "rgba(58,58,244,0.06)",
                            pointerEvents: "none",
                            transition: "left .12s ease",
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: -5,
                                width: 8,
                                height: 22,
                                marginTop: -11,
                                borderRadius: 4,
                                background: "#fff",
                                boxShadow: `0 0 0 1.5px ${C.accent}`,
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: -5,
                                width: 8,
                                height: 22,
                                marginTop: -11,
                                borderRadius: 4,
                                background: "#fff",
                                boxShadow: `0 0 0 1.5px ${C.accent}`,
                            }}
                        />
                    </div>
                </div>

                {/* alt eksen */}
                <div style={{ position: "relative", height: 16, marginTop: 12, fontFamily: MONO, fontSize: 11, color: "#5A5C63", whiteSpace: "nowrap" }}>
                    {ticks.map((d, k) => (
                        <span
                            key={d}
                            style={{
                                position: "absolute",
                                left: `${((d - 1) / days) * 100}%`,
                                transform: k === 0 ? "none" : "translateX(-2px)",
                                borderLeft: k === 0 ? "none" : `1px solid ${C.line}`,
                                paddingLeft: k === 0 ? 0 : 5,
                            }}
                        >
                            {k === 0 ? `1 ${MONTHS[month]}` : d}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function tabFromPath(p: string): TabKey {
    return TABS.find((t) => p.startsWith(t.path))?.key ?? "analytics"
}

// ---------- küçük parçalar ----------
function Icon({ name, color }: { name: string; color: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none", display: "block" }}>
            <path d={ICONS[name]} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Badge({ text }: { text: string }) {
    const good = ["Tamamlandı", "Aktif", "Çevrimiçi", "Yolda"].includes(text)
    const bad = ["İptal", "Engelli"].includes(text)
    return (
        <span
            style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 9px",
                borderRadius: 999,
                color: good ? C.accent : bad ? "#B3261E" : C.ink2,
                background: good ? "rgba(58,58,244,0.1)" : bad ? "rgba(179,38,30,0.1)" : "rgba(16,17,20,0.06)",
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </span>
    )
}

export default function AdminApp() {
    const [tab, setTab] = useState<TabKey>(() => tabFromPath(window.location.pathname))
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const [ind, setInd] = useState({ left: 0, width: 0 })

    const go = (t: (typeof TABS)[number]) => {
        window.history.pushState({}, "", t.path)
        setTab(t.key)
    }

    useEffect(() => {
        const onPop = () => setTab(tabFromPath(window.location.pathname))
        window.addEventListener("popstate", onPop)
        return () => window.removeEventListener("popstate", onPop)
    }, [])

    // sekme altındaki kayan çizgi (ana sitedeki sekme çubuğu ile aynı mantık)
    useLayoutEffect(() => {
        const place = () => {
            const el = tabRefs.current[tab]
            if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth })
        }
        place()
        window.addEventListener("resize", place)
        return () => window.removeEventListener("resize", place)
    }, [tab])

    // analitik: seçili güne ait huni, istatistik ve tablo
    const [aMonth, setAMonth] = useState(TODAY.getMonth())
    const [aDay, setADay] = useState(TODAY.getDate() - 1)
    const [picked, setPicked] = useState(false) // gün seçilene kadar sadece grafik görünür
    const showDetail = tab !== "analytics" || picked
    const aDaysInMonth = new Date(YEAR, aMonth + 1, 0).getDate()
    const aSel = Math.min(aDay, aDaysInMonth - 1)
    const funnel = dayFunnel(aMonth, aSel + 1)
    const totalFunnel = monthFunnel(aMonth)
    const dayLabel = `${aSel + 1} ${MONTHS[aMonth]} ${YEAR}`
    const worst = funnel
        .slice(1, 4)
        .map((s, i) => ({ s, lost: funnel[i].count - s.count }))
        .sort((a, b) => b.lost - a.lost)[0]
    const page =
        tab === "analytics"
            ? {
                  title: "Kullanıcı Akışı & Tıklamalar",
                  sub: `${dayLabel} · seçili günün istatistikleri ve dönüşüm hunisi`,
                  stats: [
                      { label: "Ana Sayfa", value: funnel[0].count.toLocaleString("tr-TR"), hint: "o gün ziyaret" },
                      { label: "Taksi Çağır", value: funnel[2].count.toLocaleString("tr-TR"), hint: `%${funnel[2].pct} tıklama`.replace(".", ",") },
                      { label: "En Çok Çıkış", value: worst.s.label.split(" ")[0], hint: `${Math.max(0, worst.lost)} kişi ayrıldı` },
                      { label: "Tamamlanan", value: funnel[6].count.toLocaleString("tr-TR"), hint: `%${funnel[6].pct} dönüşüm`.replace(".", ",") },
                  ],
                  columns: ["Adım / Buton", "Tıklama", "Toplam Oran", "Ayrılan (Terk)", "Durum"],
                  rows: funnel.map((s, i) => [
                      s.label,
                      s.count.toLocaleString("tr-TR"),
                      `%${s.pct}`.replace(".", ","),
                      s.drop === "—" ? "—" : s.drop,
                      i === funnel.length - 1 ? "Tamamlandı" : s.drop !== "—" && s === worst.s ? "İptal" : "Aktif",
                  ]),
              }
            : PAGES[tab]

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                overflowY: "auto",
                background: C.bg,
                color: C.ink,
                fontFamily: SANS,
            }}
        >
            <style>{`
              .ad-card{background:${C.glass};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
                border-radius:20px;box-shadow:rgba(30,28,20,.12) 0 18px 40px -20px, ${C.line} 0 0 0 1px}
              .ad-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
              .ad-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch}
              .ad-tabs::-webkit-scrollbar{display:none}
              .ad-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;align-items:center;
                padding:14px 18px;border-bottom:1px solid ${C.line};font-size:14px}
              .ad-head{font-family:${MONO};font-size:11px;color:${C.ink2};letter-spacing:.01em}
              .ad-btn{border:0;cursor:pointer;font-family:${SANS};font-weight:600;font-size:14px;
                padding:10px 16px;border-radius:999px;background:${C.accent};color:#fff}
              @media (max-width:760px){
                .ad-stats{grid-template-columns:repeat(2,1fr)}
                .ad-two{grid-template-columns:1fr}
                .ad-row{grid-template-columns:1fr 1fr;row-gap:6px}
                .ad-head-row{display:none}
              }
            `}</style>

            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 16px 48px" }}>
                {/* üst çubuk */}
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
                    <a
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            fontWeight: 600,
                            fontSize: 17,
                            letterSpacing: "-0.03em",
                            color: C.ink,
                            textDecoration: "none",
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="3" y="10" width="18" height="7.5" rx="2.5" fill="none" stroke="#101114" strokeWidth="1.8" />
                            <path d="M6 10L8 5.5h8l2 4.5" fill="none" stroke="#101114" strokeWidth="1.8" strokeLinejoin="round" />
                            <rect x="10" y="3.5" width="4" height="2" rx="0.8" fill="#F5B800" stroke="#101114" strokeWidth="1" />
                            <circle cx="7" cy="17.5" r="2.2" fill="#101114" />
                            <circle cx="17" cy="17.5" r="2.2" fill="#101114" />
                            <circle cx="12" cy="12.8" r="1.8" fill="#3A3AF4" />
                        </svg>
                        Paytaksi
                        <span style={{ fontFamily: MONO, fontSize: 11, color: "#fff", background: C.accent, padding: "3px 7px", borderRadius: 999 }}>
                            ADMIN
                        </span>
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, color: C.ink2 }}>admin@paytaksi.com</span>
                        <button className="ad-btn" style={{ background: "rgba(16,17,20,0.06)", color: C.ink }}>
                            Çıkış
                        </button>
                    </div>
                </header>

                {/* sekme çubuğu (verilen koddaki yapı) */}
                <div
                    role="tablist"
                    aria-label="Admin sayfaları"
                    className="ad-tabs"
                    style={{
                        position: "relative",
                        display: "flex",
                        gap: 6,
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        paddingBottom: 12,
                        marginTop: 8,
                        borderBottom: `1px solid ${C.line}`,
                    }}
                >
                    {TABS.map((t) => {
                        const on = t.key === tab
                        return (
                            <button
                                key={t.key}
                                ref={(el) => {
                                    tabRefs.current[t.key] = el
                                }}
                                role="tab"
                                aria-selected={on}
                                onClick={() => go(t)}
                                className="ss-btn ss-focus"
                                style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "10px 14px",
                                    border: 0,
                                    borderRadius: 14,
                                    cursor: "pointer",
                                    background: on ? "rgba(255,255,255,0.7)" : "transparent",
                                    color: on ? C.ink : C.ink2,
                                    fontFamily: SANS,
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                <Icon name={t.key} color={on ? C.ink : C.ink2} />
                                {t.label}
                            </button>
                        )
                    })}
                    <span
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            bottom: -1,
                            left: ind.left,
                            width: ind.width,
                            height: 2,
                            background: C.ink,
                            borderRadius: 2,
                            transition: "left 0.55s cubic-bezier(0.65,0,0.35,1), width 0.55s cubic-bezier(0.65,0,0.35,1)",
                        }}
                    />
                </div>

                {/* sayfa başlığı */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "28px 0 18px", flexWrap: "wrap" }}>
                    <div>
                        <div className="ad-head" style={{ marginBottom: 6 }}>PAYTAKSI / ADMIN</div>
                        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "-0.04em" }}>{page.title}</h1>
                        <div style={{ color: C.ink2, fontSize: 14, marginTop: 4 }}>{page.sub}</div>
                    </div>
                    {tab !== "analytics" && <button className="ad-btn">+ Yeni ekle</button>}
                </div>

                {/* analitik sayfasına özel: günlük çağrı sütunları (gün seç) */}
                {tab === "analytics" && (
                    <DailyCalls
                        month={aMonth}
                        setMonth={setAMonth}
                        day={aSel}
                        setDay={(d) => {
                            setADay(d)
                            setPicked(true)
                        }}
                    />
                )}

                {/* analitikte sol: günlük analitik, sağ: aylık toplam analitik */}
                {tab === "analytics" && (
                    <div className="ad-two" style={{ marginTop: 18 }}>
                        <AnalyticsCard
                            badge="GÜNLÜK"
                            title={dayLabel}
                            subtitle="Seçili günün kullanıcı akışı"
                            funnel={funnel}
                            ctaLabel="Günün Yolculuklarını Gör"
                            onCta={() => go(TABS[1])}
                        />
                        <AnalyticsCard
                            badge="TOPLAM"
                            title={`${MONTHS[aMonth]} ${YEAR} Toplam`}
                            subtitle="Ay geneli tüm günlerin toplamı"
                            funnel={totalFunnel}
                            accentBg={C.ink}
                            ctaLabel="Finans Özetini Gör"
                            onCta={() => go(TABS[4])}
                        />
                    </div>
                )}

                {tab !== "analytics" && (
                <>
                {/* istatistik kartları */}
                <div className="ad-stats">
                    {page.stats.map((s) => (
                        <div key={s.label} className="ad-card" style={{ padding: "16px 18px" }}>
                            <div className="ad-head">{s.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", margin: "6px 0 2px" }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: C.ink2 }}>{s.hint}</div>
                        </div>
                    ))}
                </div>

                {/* tablo */}
                <div className="ad-card" style={{ marginTop: 16, overflow: "hidden" }}>
                    <div className="ad-row ad-head ad-head-row" style={{ background: "rgba(16,17,20,0.03)" }}>
                        {page.columns.map((c) => (
                            <div key={c}>{c}</div>
                        ))}
                    </div>
                    {page.rows.map((r, i) => (
                        <div key={i} className="ad-row">
                            {r.map((cell, j) =>
                                j === r.length - 1 ? (
                                    <div key={j}>
                                        <Badge text={cell} />
                                    </div>
                                ) : (
                                    <div key={j} style={{ fontWeight: j === 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {cell}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
                </>
                )}
            </div>
        </div>
    )
}
