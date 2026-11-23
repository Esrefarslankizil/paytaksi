// PayTaksi · Admin Paneli (/admin)
// %100 gerçek canlı veriler — ASP.NET Core 8 API (/api/analytics, /api/rides, /api/users, /api/drivers)
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import AuthPage, { AuthUser, TOKEN_KEY, getApiBase } from "../auth/AuthPage"

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

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]

interface DailyPoint {
    day: number
    pageView: number
    locationSelect: number
    callClick: number
    paymentOpen: number
    walletClick: number
    cashClick: number
    completed: number
}

interface RideRow {
    id: number
    pickupAddress: string
    destinationAddress: string
    customerPhone: string
    paymentType: string
    status: string
    whatsAppSent: boolean
    createdAt: string
    driver: { fullName: string; plate: string } | null
}

interface DriverRow {
    id: number
    fullName: string
    phone: string
    plate: string
    station: string
    shiftStart: string
    shiftEnd: string
    pausedUntil: string | null
    isActiveNow: boolean
}

interface UserRow {
    id: string
    email: string
    fullName: string
    phoneNumber?: string | null
    roles: string[]
}

function toFunnelSteps(p: DailyPoint) {
    const visits = Math.max(p.pageView, p.callClick, p.completed, 1)
    const pct = (n: number) => Math.round((n / visits) * 1000) / 10
    return [
        { label: "Ana Sayfa Ziyaret", count: p.pageView, pct: p.pageView > 0 ? 100 : 0 },
        { label: "Nereden / Nereye Seçimi", count: p.locationSelect, pct: pct(p.locationSelect) },
        { label: "Taksi Çağır Butonu", count: p.callClick, pct: pct(p.callClick) },
        { label: "Ödeme Ekranı Açıldı", count: p.paymentOpen, pct: pct(p.paymentOpen) },
        { label: "Online Ödeme (%15)", count: p.walletClick, pct: pct(p.walletClick) },
        { label: "Nakitle Devam Et", count: p.cashClick, pct: pct(p.cashClick) },
        { label: "Çağrı Tamamlandı", count: p.completed, pct: pct(p.completed) },
    ]
}

function sumDaily(list: DailyPoint[]): DailyPoint {
    return list.reduce(
        (acc, d) => ({
            day: 0,
            pageView: acc.pageView + d.pageView,
            locationSelect: acc.locationSelect + d.locationSelect,
            callClick: acc.callClick + d.callClick,
            paymentOpen: acc.paymentOpen + d.paymentOpen,
            walletClick: acc.walletClick + d.walletClick,
            cashClick: acc.cashClick + d.cashClick,
            completed: acc.completed + d.completed,
        }),
        { day: 0, pageView: 0, locationSelect: 0, callClick: 0, paymentOpen: 0, walletClick: 0, cashClick: 0, completed: 0 }
    )
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
    funnel: ReturnType<typeof toFunnelSteps>
    accentBg?: string
    ctaLabel: string
    onCta: () => void
}) {
    const worst = funnel
        .slice(1, 4)
        .map((s, i) => ({ s, lost: Math.max(0, funnel[i].count - s.count) }))
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div>
                        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 500, letterSpacing: "-0.04em" }}>
                            {funnel[6].count.toLocaleString("tr-TR")}
                        </span>{" "}
                        <span style={{ fontSize: 13, color: "#5A5C63" }}>tamamlanan çağrı</span>
                    </div>
                    <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5, color: C.ink, fontFamily: MONO }}>
                        %{String(funnel[6].pct).replace(".", ",")}
                    </div>
                </div>

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
                        <div style={{ fontSize: 14, fontWeight: 500, fontFamily: MONO }}>{funnel[0].count.toLocaleString("tr-TR")}</div>
                    </div>
                    <div style={{ padding: "9px 12px", borderLeft: "1px solid rgba(16,17,20,0.09)" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#5A5C63" }}>
                            Taksi Çağır
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500, fontFamily: MONO }}>{funnel[2].count.toLocaleString("tr-TR")}</div>
                    </div>
                    <div style={{ gridColumn: "1 / 3", padding: "9px 12px", borderTop: "1px solid rgba(16,17,20,0.09)", background: "rgba(179,38,30,0.03)" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#5A5C63" }}>
                            En Çok Çıkış Yapılan Adım
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 1 }}>
                            {worst.lost > 0 ? (
                                <>
                                    {worst.s.label} ·{" "}
                                    <span style={{ color: "#B3261E", fontFamily: MONO }}>{worst.lost.toLocaleString("tr-TR")} kişi</span>
                                </>
                            ) : (
                                "Henüz terk verisi yok"
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ height: 1, background: "rgba(16,17,20,0.09)", margin: "14px 0 8px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {funnel.slice(0, -1).map((st) => (
                        <div key={st.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, fontSize: 13.5, color: "#101114" }}>
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
                                        width: `${st.count > 0 ? Math.max(4, st.pct) : 0}%`,
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

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15.5, fontWeight: 600, padding: "11px 0 0", color: "#101114" }}>
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
                    <span>
                        {funnel[4].count.toLocaleString("tr-TR")} Cüzdan · {funnel[5].count.toLocaleString("tr-TR")} Nakit
                    </span>
                </div>
            </div>

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
    )
}

function DailyCalls({
    month,
    setMonth,
    day,
    setDay,
    daily,
}: {
    month: number
    setMonth: (m: number) => void
    day: number
    setDay: (d: number) => void
    daily: DailyPoint[]
}) {
    const days = daily.length || 30
    const data = daily.map((d) => d.completed + d.callClick)
    const max = Math.max(...data, 1)
    const sel = Math.max(0, Math.min(day, days - 1))
    const left = (sel / days) * 100
    const width = (1 / days) * 100
    const center = left + width / 2

    const BAR_H = 56
    const barPx = (v: number) => (v === 0 ? 4 : Math.max(8, (v / max) * BAR_H))

    const barsRef = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)
    const pick = (clientX: number) => {
        const r = barsRef.current!.getBoundingClientRect()
        const i = Math.floor(((clientX - r.left) / r.width) * days)
        setDay(Math.max(0, Math.min(days - 1, i)))
    }

    const ticks = [1, 8, 15, 22, 29].filter((d) => d <= days)

    return (
        <div className="ad-card" style={{ marginTop: 16, padding: "18px 20px 14px" }}>
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
                    <span style={{ fontFamily: MONO, fontWeight: 500 }}>{daily[sel]?.completed ?? 0} çağrı</span>
                    <span style={{ opacity: 0.7 }}>
                        {sel + 1} {MONTHS[month]}
                    </span>
                </div>

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
                        gap: 3,
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
                                borderRadius: "6px 6px 3px 3px",
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
                        <span style={{ position: "absolute", top: "50%", left: -5, width: 8, height: 22, marginTop: -11, borderRadius: 4, background: "#fff", boxShadow: `0 0 0 1.5px ${C.accent}` }} />
                        <span style={{ position: "absolute", top: "50%", right: -5, width: 8, height: 22, marginTop: -11, borderRadius: 4, background: "#fff", boxShadow: `0 0 0 1.5px ${C.accent}` }} />
                    </div>
                </div>

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

function Icon({ name, color }: { name: string; color: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none", display: "block" }}>
            <path d={ICONS[name]} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Badge({ text }: { text: string }) {
    const good = ["Tamamlandı", "Aktif", "Çevrimiçi", "Sürücüye İletildi", "Admin"].includes(text)
    const bad = ["İptal", "Aktif Sürücü Yok", "Pasif"].includes(text)
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
    const now = new Date()
    const [adminUser, setAdminUser] = useState<AuthUser | null>(null)
    const [authChecking, setAuthChecking] = useState(true)
    const [tab, setTab] = useState<TabKey>(() => tabFromPath(window.location.pathname))
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const [ind, setInd] = useState({ left: 0, width: 0 })

    const [aMonth, setAMonth] = useState(now.getMonth())
    const [aDay, setADay] = useState(now.getDate() - 1)
    const [daily, setDaily] = useState<DailyPoint[]>([])
    const [rides, setRides] = useState<RideRow[]>([])
    const [drivers, setDrivers] = useState<DriverRow[]>([])
    const [users, setUsers] = useState<UserRow[]>([])

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) {
            setAuthChecking(false)
            return
        }
        fetch(`${getApiBase()}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((u: AuthUser | null) => {
                if (u && u.roles.includes("Admin")) setAdminUser(u)
                else localStorage.removeItem(TOKEN_KEY)
            })
            .catch(() => {})
            .finally(() => setAuthChecking(false))
    }, [])

    const loadLiveData = async () => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) return
        const base = getApiBase()
        const auth = { headers: { Authorization: `Bearer ${token}` } }
        try {
            const [anRes, rRes, dRes, uRes] = await Promise.all([
                fetch(`${base}/api/analytics/summary?year=${now.getFullYear()}&month=${aMonth + 1}`),
                fetch(`${base}/api/rides`),
                fetch(`${base}/api/drivers`),
                fetch(`${base}/api/users`, auth),
            ])
            if (anRes.ok) {
                const an = await anRes.json()
                setDaily(an.daily || [])
            }
            if (rRes.ok) setRides(await rRes.json())
            if (dRes.ok) setDrivers(await dRes.json())
            if (uRes.ok) setUsers(await uRes.json())
        } catch {}
    }

    useEffect(() => {
        if (adminUser) loadLiveData()
    }, [adminUser, aMonth])

    const go = (t: (typeof TABS)[number]) => {
        window.history.pushState({}, "", t.path)
        setTab(t.key)
    }

    useEffect(() => {
        const onPop = () => setTab(tabFromPath(window.location.pathname))
        window.addEventListener("popstate", onPop)
        return () => window.removeEventListener("popstate", onPop)
    }, [])

    useLayoutEffect(() => {
        const place = () => {
            const el = tabRefs.current[tab]
            if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth })
        }
        place()
        window.addEventListener("resize", place)
        return () => window.removeEventListener("resize", place)
    }, [tab, adminUser])

    if (authChecking) {
        return (
            <div style={{ width: "100vw", height: "100dvh", display: "grid", placeItems: "center", background: C.bg, fontFamily: SANS, color: C.ink2 }}>
                Yetki kontrol ediliyor...
            </div>
        )
    }

    if (!adminUser) {
        return <AuthPage initialMode="login" requireRole="Admin" onAuthenticated={(u) => setAdminUser(u)} />
    }

    const daysInMonth = daily.length || new Date(now.getFullYear(), aMonth + 1, 0).getDate()
    const aSel = Math.max(0, Math.min(aDay, daysInMonth - 1))
    const emptyDay: DailyPoint = { day: aSel + 1, pageView: 0, locationSelect: 0, callClick: 0, paymentOpen: 0, walletClick: 0, cashClick: 0, completed: 0 }
    const dayPoint = daily[aSel] ?? emptyDay
    const funnel = toFunnelSteps(dayPoint)
    const totalFunnel = toFunnelSteps(sumDaily(daily))
    const dayLabel = `${aSel + 1} ${MONTHS[aMonth]} ${now.getFullYear()}`

    const activeDriverCount = drivers.filter((d) => d.isActiveNow).length
    const grossRevenue = rides.length * 200
    const commission = Math.round(grossRevenue * 0.15)
    const cashRides = rides.filter((r) => r.paymentType === "Nakit").length

    const pageData = {
        analytics: {
            title: "Kullanıcı Akışı & Tıklamalar",
            sub: "Canlı veritabanından anlık günlük ve aylık analiz",
            stats: [],
            columns: [],
            rows: [] as string[][],
        },
        rides: {
            title: "Yolculuklar",
            sub: "Gerçek zamanlı gelen tüm taksi çağrıları",
            stats: [
                { label: "Toplam Çağrı", value: String(rides.length), hint: "veritabanı" },
                { label: "Nakit", value: String(cashRides), hint: "araçta ödeme" },
                { label: "Cüzdan / Üye", value: String(rides.length - cashRides), hint: "indirimli" },
                { label: "WhatsApp İletilen", value: String(rides.filter((r) => r.whatsAppSent).length), hint: "otomatik" },
            ],
            columns: ["No", "Güzergah", "Müşteri", "Sürücü", "Durum"],
            rows: rides.map((r) => [
                `#${r.id}`,
                `${r.pickupAddress} → ${r.destinationAddress}`,
                r.customerPhone,
                r.driver ? `${r.driver.fullName} (${r.driver.plate})` : "—",
                r.status,
            ]),
        },
        passengers: {
            title: "Kullanıcılar & Yolcular",
            sub: "ASP.NET Core Identity kayıtlı hesapları",
            stats: [
                { label: "Toplam Hesap", value: String(users.length), hint: "kayıtlı" },
                { label: "Yolcu", value: String(users.filter((u) => u.roles.includes("Yolcu")).length), hint: "rol" },
                { label: "Taksici", value: String(users.filter((u) => u.roles.includes("Taksici")).length), hint: "rol" },
                { label: "Admin", value: String(users.filter((u) => u.roles.includes("Admin")).length), hint: "yönetici" },
            ],
            columns: ["Ad Soyad", "E-posta", "Telefon", "ID", "Rol"],
            rows: users.map((u) => [u.fullName || "—", u.email, u.phoneNumber || "—", u.id.slice(0, 8), u.roles.join(", ") || "Yolcu"]),
        },
        drivers: {
            title: "Sürücüler",
            sub: "Canlı vardiya ve otomatik aktiflik durumları",
            stats: [
                { label: "Toplam Sürücü", value: String(drivers.length), hint: "kayıtlı" },
                { label: "Şu An Aktif", value: String(activeDriverCount), hint: "vardiyada" },
                { label: "Pasif / İzinli", value: String(drivers.length - activeDriverCount), hint: "mesai dışı" },
                { label: "Durak", value: String(new Set(drivers.map((d) => d.station)).size), hint: "bölge" },
            ],
            columns: ["Ad Soyad", "Plaka", "Telefon", "Vardiya", "Durum"],
            rows: drivers.map((d) => [d.fullName, d.plate, d.phone, `${d.shiftStart} – ${d.shiftEnd}`, d.isActiveNow ? "Aktif" : "Pasif"]),
        },
        finance: {
            title: "Finans",
            sub: "Gerçek yolculuklardan hesaplanan ciro ve komisyon",
            stats: [
                { label: "Toplam Ciro", value: `₺${grossRevenue.toLocaleString("tr-TR")}`, hint: `${rides.length} çağrı` },
                { label: "Komisyon (%15)", value: `₺${commission.toLocaleString("tr-TR")}`, hint: "platform payı" },
                { label: "Sürücü Payı", value: `₺${(grossRevenue - commission).toLocaleString("tr-TR")}`, hint: "%85" },
                { label: "Nakit Çağrı", value: String(cashRides), hint: "araçta ödeme" },
            ],
            columns: ["Tarih", "Güzergah", "Ödeme", "Tutar", "Durum"],
            rows: rides.map((r) => [
                new Date(r.createdAt).toLocaleDateString("tr-TR"),
                `${r.pickupAddress} → ${r.destinationAddress}`,
                r.paymentType,
                "₺200",
                r.status,
            ]),
        },
    }[tab]

    return (
        <div style={{ width: "100vw", height: "100dvh", overflowY: "auto", background: C.bg, color: C.ink, fontFamily: SANS }}>
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
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
                    <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 17, letterSpacing: "-0.03em", color: C.ink, textDecoration: "none" }}>
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
                        <span style={{ fontSize: 13, color: C.ink2 }}>{adminUser.email}</span>
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem(TOKEN_KEY)
                                setAdminUser(null)
                            }}
                            className="ad-btn"
                            style={{ background: "rgba(16,17,20,0.06)", color: C.ink }}
                        >
                            Çıkış
                        </button>
                    </div>
                </header>

                <div
                    role="tablist"
                    aria-label="Admin sayfaları"
                    className="ad-tabs"
                    style={{ position: "relative", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 12, marginTop: 8, borderBottom: `1px solid ${C.line}` }}
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

                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "28px 0 18px", flexWrap: "wrap" }}>
                    <div>
                        <div className="ad-head" style={{ marginBottom: 6 }}>PAYTAKSI / ADMIN · CANLI VERİ</div>
                        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "-0.04em" }}>{pageData.title}</h1>
                        <div style={{ color: C.ink2, fontSize: 14, marginTop: 4 }}>{pageData.sub}</div>
                    </div>
                    <button type="button" onClick={loadLiveData} className="ad-btn" style={{ background: "rgba(16,17,20,0.08)", color: C.ink }}>
                        Yenile
                    </button>
                </div>

                {tab === "analytics" && (
                    <>
                        <DailyCalls month={aMonth} setMonth={setAMonth} day={aSel} setDay={setADay} daily={daily} />
                        <div className="ad-two" style={{ marginTop: 18 }}>
                            <AnalyticsCard
                                badge="GÜNLÜK"
                                title={dayLabel}
                                subtitle="Seçili günün canlı akışı"
                                funnel={funnel}
                                ctaLabel="Günün Yolculuklarını Gör"
                                onCta={() => go(TABS[1])}
                            />
                            <AnalyticsCard
                                badge="TOPLAM"
                                title={`${MONTHS[aMonth]} ${now.getFullYear()} Toplam`}
                                subtitle="Ay geneli canlı toplam"
                                funnel={totalFunnel}
                                accentBg={C.ink}
                                ctaLabel="Finans Özetini Gör"
                                onCta={() => go(TABS[4])}
                            />
                        </div>
                    </>
                )}

                {tab !== "analytics" && (
                    <>
                        <div className="ad-stats">
                            {pageData.stats.map((s) => (
                                <div key={s.label} className="ad-card" style={{ padding: "16px 18px" }}>
                                    <div className="ad-head">{s.label}</div>
                                    <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", margin: "6px 0 2px" }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: C.ink2 }}>{s.hint}</div>
                                </div>
                            ))}
                        </div>

                        <div className="ad-card" style={{ marginTop: 16, overflow: "hidden" }}>
                            <div className="ad-row ad-head ad-head-row" style={{ background: "rgba(16,17,20,0.03)" }}>
                                {pageData.columns.map((c) => (
                                    <div key={c}>{c}</div>
                                ))}
                            </div>
                            {pageData.rows.length === 0 ? (
                                <div style={{ padding: "28px 18px", textAlign: "center", color: C.ink2, fontSize: 14 }}>
                                    Henüz kayıt yok.
                                </div>
                            ) : (
                                pageData.rows.map((r, i) => (
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
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
