// PayTaksi · Sürücü Paneli (/surucu)
// Ana site ve admin paneliyle aynı tasarım dili (palet, font, cam/beyaz kartlar, sekme çubuğu)
// Doğrudan .NET API (/api/drivers ve /api/rides) ile canlı çalışır.
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import AuthPage, { AuthUser, TOKEN_KEY, getApiBase } from "../auth/AuthPage"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16,17,20,0.09)",
    accent: "#3A3AF4",
    glass: "rgba(252,251,248,0.78)",
    ok: "#0E8A5F",
}
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

const ICONS: Record<string, string> = {
    calls: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5",
    shift: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
    earnings: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM15.5 11.5h4.5v3h-4.5a1.5 1.5 0 0 1 0-3zM7 9h5",
}

type TabKey = "calls" | "shift" | "earnings"
const TABS: { key: TabKey; label: string; path: string }[] = [
    { key: "calls", label: "Çağrılar", path: "/surucu/cagrilar" },
    { key: "shift", label: "Vardiya", path: "/surucu/vardiya" },
    { key: "earnings", label: "Kazanç", path: "/surucu/kazanc" },
]

interface DriverItem {
    id: number
    fullName: string
    phone: string
    plate: string
    station: string
    shiftStart: string
    shiftEnd: string
    pausedUntil: string | null
    isEnabled: boolean
    isActiveNow: boolean
}

interface RideItem {
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

function tabFromPath(p: string): TabKey {
    return TABS.find((t) => p.startsWith(t.path))?.key ?? "calls"
}

function Icon({ name, color }: { name: string; color: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none", display: "block" }}>
            <path d={ICONS[name]} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default function DriverApp() {
    const apiBase = getApiBase()
    const [driverUser, setDriverUser] = useState<AuthUser | null>(null)
    const [authChecking, setAuthChecking] = useState(true)
    const [tab, setTab] = useState<TabKey>(() => tabFromPath(window.location.pathname))
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const [ind, setInd] = useState({ left: 0, width: 0 })

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token || token.startsWith("google_oauth_")) {
            setAuthChecking(false)
            return
        }
        fetch(`${apiBase}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((u: AuthUser | null) => {
                if (u && (u.roles.includes("Taksici") || u.roles.includes("Admin"))) {
                    setDriverUser(u)
                }
            })
            .catch(() => {})
            .finally(() => setAuthChecking(false))
    }, [])

    const [drivers, setDrivers] = useState<DriverItem[]>([])
    const [driverId, setDriverId] = useState<number>(1)
    const [rides, setRides] = useState<RideItem[]>([])
    const [shiftStart, setShiftStart] = useState("08:00")
    const [shiftEnd, setShiftEnd] = useState("23:59")
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<string | null>(null)
    const [apiOffline, setApiOffline] = useState(false)

    const driver = drivers.find((d) => d.id === driverId) ?? drivers[0] ?? null

    const flash = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3200)
    }

    const loadAll = async () => {
        const token = localStorage.getItem(TOKEN_KEY)
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
        try {
            const [dRes, rRes] = await Promise.all([
                fetch(`${apiBase}/api/drivers`, { headers: authHeaders }),
                fetch(`${apiBase}/api/rides`, { headers: authHeaders }),
            ])
            if (!dRes.ok || !rRes.ok) throw new Error()
            const dList: DriverItem[] = await dRes.json()
            const rList: RideItem[] = await rRes.json()
            setDrivers(dList)
            setRides(rList)
            setApiOffline(false)
            const cur = dList.find((x) => x.id === driverId) ?? dList[0]
            if (cur) {
                setDriverId(cur.id)
                setShiftStart(cur.shiftStart)
                setShiftEnd(cur.shiftEnd)
            }
        } catch {
            setApiOffline(true)
        }
    }

    useEffect(() => {
        if (!driverUser) return
        loadAll()
        const t = setInterval(loadAll, 8000)
        return () => clearInterval(t)
    }, [driverId, driverUser])

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
    }, [tab, driverUser])

    if (authChecking) {
        return (
            <div style={{ width: "100vw", height: "100dvh", display: "grid", placeItems: "center", background: C.bg, fontFamily: SANS, color: C.ink2 }}>
                Sürücü yetkisi kontrol ediliyor...
            </div>
        )
    }

    if (!driverUser) {
        return <AuthPage initialMode="login" requireRole="Taksici" onAuthenticated={(u) => setDriverUser(u)} />
    }

    const togglePauseToday = async () => {
        if (!driver) return
        setSaving(true)
        try {
            const paused = Boolean(driver.pausedUntil && new Date(driver.pausedUntil) > new Date())
            const ep = paused ? "resume" : "pause-today"
            const token = localStorage.getItem(TOKEN_KEY)
            const res = await fetch(`${apiBase}/api/drivers/${driver.id}/${ep}`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            if (res.ok) {
                await loadAll()
                flash(paused ? "Vardiyan tekrar aktif edildi." : "Bugünlük kapatıldı, yarın otomatik açılacak.")
            }
        } finally {
            setSaving(false)
        }
    }

    const saveSchedule = async () => {
        if (!driver) return
        setSaving(true)
        try {
            const token = localStorage.getItem(TOKEN_KEY)
            const res = await fetch(`${apiBase}/api/drivers/${driver.id}/schedule`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ shiftStart, shiftEnd, isEnabled: true }),
            })
            if (res.ok) {
                await loadAll()
                flash(`Çalışma saatleri güncellendi (${shiftStart} – ${shiftEnd}).`)
            }
        } finally {
            setSaving(false)
        }
    }

    const isPaused = Boolean(driver?.pausedUntil && new Date(driver.pausedUntil) > new Date())
    const myRides = driver ? rides.filter((r) => !r.driver || r.driver.plate === driver.plate) : rides
    const cashCount = myRides.filter((r) => r.paymentType === "Nakit").length
    const walletCount = myRides.length - cashCount

    return (
        <div
            style={{
                width: "100vw",
                height: "100dvh",
                overflowY: "auto",
                background: C.bg,
                color: C.ink,
                fontFamily: SANS,
            }}
        >
            <style>{`
              .dr-card{background:${C.glass};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
                border-radius:20px;box-shadow:rgba(30,28,20,.12) 0 18px 40px -20px, ${C.line} 0 0 0 1px}
              .dr-white{background:#fff;border-radius:22px;padding:22px;
                box-shadow:0 30px 70px -30px rgba(30,28,20,0.3), 0 0 0 1px rgba(16,17,20,0.06)}
              .dr-tabs::-webkit-scrollbar{display:none}
              .dr-head{font-family:${MONO};font-size:11px;color:${C.ink2};letter-spacing:.02em;text-transform:uppercase}
              .dr-btn{border:0;cursor:pointer;font-family:${SANS};font-weight:600;font-size:14px;
                padding:11px 16px;border-radius:14px;background:${C.accent};color:#fff}
              .dr-btn:disabled{opacity:.5;cursor:not-allowed}
              .dr-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
              @media (max-width:720px){.dr-grid{grid-template-columns:1fr}}
            `}</style>

            <div style={{ maxWidth: 920, margin: "0 auto", padding: "16px 16px 56px" }}>
                {/* Üst çubuk */}
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 56, flexWrap: "wrap" }}>
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
                        <span style={{ fontFamily: MONO, fontSize: 11, color: "#fff", background: C.ink, padding: "3px 8px", borderRadius: 999 }}>
                            SÜRÜCÜ
                        </span>
                    </a>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                            style={{
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontFamily: SANS,
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.ink,
                            }}
                        >
                            {driver ? `${driver.fullName} · ${driver.plate}` : driverUser.fullName}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem(TOKEN_KEY)
                                setDriverUser(null)
                            }}
                            style={{
                                border: `1px solid ${C.line}`,
                                background: "rgba(255,255,255,0.7)",
                                borderRadius: 999,
                                padding: "6px 12px",
                                fontFamily: SANS,
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: C.ink2,
                                cursor: "pointer",
                            }}
                        >
                            Çıkış
                        </button>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontFamily: MONO,
                                fontSize: 11.5,
                                fontWeight: 600,
                                padding: "6px 11px",
                                borderRadius: 999,
                                background: driver?.isActiveNow ? "rgba(14,138,95,0.12)" : "rgba(16,17,20,0.07)",
                                color: driver?.isActiveNow ? C.ok : C.ink2,
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 99,
                                    background: driver?.isActiveNow ? C.ok : "#999",
                                }}
                            />
                            {driver?.isActiveNow ? "AKTİF" : isPaused ? "İZİNLİ" : "MESAİ DIŞI"}
                        </span>
                    </div>
                </header>

                {/* Sekme çubuğu (Admin paneli ile birebir aynı yapı) */}
                <div
                    role="tablist"
                    aria-label="Sürücü sayfaları"
                    className="dr-tabs"
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
                                style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "10px 16px",
                                    border: 0,
                                    borderRadius: 14,
                                    cursor: "pointer",
                                    background: on ? "rgba(255,255,255,0.75)" : "transparent",
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

                {/* Toast & API uyarısı */}
                {toast && (
                    <div
                        style={{
                            marginTop: 14,
                            padding: "10px 14px",
                            borderRadius: 14,
                            background: C.ink,
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        {toast}
                    </div>
                )}
                {apiOffline && (
                    <div
                        style={{
                            marginTop: 14,
                            padding: "10px 14px",
                            borderRadius: 14,
                            background: "rgba(179,38,30,0.08)",
                            color: "#B3261E",
                            fontSize: 13,
                        }}
                    >
                        Backend API bağlantısı kurulamadı ({apiBase}).
                    </div>
                )}

                {/* 1. SEKME: ÇAĞRILAR */}
                {tab === "calls" && (
                    <div style={{ marginTop: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                            <div>
                                <div className="dr-head">PAYTAKSI / SÜRÜCÜ</div>
                                <h1 style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em" }}>Gelen Çağrılar</h1>
                                <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 3 }}>
                                    {driver ? `${driver.fullName} · ${driver.plate} · ${driver.station}` : "Sürücü bilgisi yükleniyor..."}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={loadAll}
                                className="dr-btn"
                                style={{ background: "rgba(16,17,20,0.07)", color: C.ink, borderRadius: 999, padding: "9px 15px" }}
                            >
                                Yenile
                            </button>
                        </div>

                        {/* Hızlı durum şeridi */}
                        {driver && (
                            <div
                                className="dr-card"
                                style={{
                                    padding: "14px 18px",
                                    marginBottom: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div>
                                    <div className="dr-head">Vardiya Durumu</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>
                                        {driver.isActiveNow
                                            ? `Aktif · Çalışma saatleri ${driver.shiftStart} – ${driver.shiftEnd}`
                                            : isPaused
                                                ? `Bugünlük kapalı · Yarın ${driver.shiftStart}'da otomatik açılacak`
                                                : `Mesai dışı · Saat ${driver.shiftStart}'da açılacak`}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={togglePauseToday}
                                    className="dr-btn"
                                    style={{
                                        borderRadius: 999,
                                        background: isPaused ? C.ok : C.ink,
                                        padding: "9px 16px",
                                        fontSize: 13,
                                    }}
                                >
                                    {isPaused ? "Tekrar Aktif Et" : "Bugünlük Kapat"}
                                </button>
                            </div>
                        )}

                        {myRides.length === 0 ? (
                            <div className="dr-white" style={{ textAlign: "center", padding: "36px 20px", color: C.ink2 }}>
                                Henüz gelen taksi çağrısı yok. Yeni çağrı geldiğinde burada otomatik görünür.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {myRides.map((r) => (
                                    <div key={r.id} className="dr-white" style={{ padding: 18 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <span style={{ fontFamily: MONO, fontSize: 12, color: C.ink2 }}>
                                                #{r.id} · {new Date(r.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily: MONO,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: "4px 9px",
                                                    borderRadius: 999,
                                                    background: "rgba(58,58,244,0.1)",
                                                    color: C.accent,
                                                }}
                                            >
                                                {r.paymentType} · {r.status}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                border: `1px solid ${C.line}`,
                                                borderRadius: 14,
                                                overflow: "hidden",
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                            }}
                                        >
                                            <div style={{ padding: "9px 12px" }}>
                                                <div className="dr-head">Alış Yeri</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{r.pickupAddress}</div>
                                            </div>
                                            <div style={{ padding: "9px 12px", borderLeft: `1px solid ${C.line}` }}>
                                                <div className="dr-head">Varış Yeri</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{r.destinationAddress}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                            <a
                                                href={`tel:${r.customerPhone.replace(/\s+/g, "")}`}
                                                className="dr-btn"
                                                style={{ flex: 1, textAlign: "center", textDecoration: "none", minWidth: 150 }}
                                            >
                                                Müşteriyi Ara ({r.customerPhone})
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.pickupAddress + " Elazığ")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    flex: 1,
                                                    minWidth: 140,
                                                    textAlign: "center",
                                                    textDecoration: "none",
                                                    padding: "11px 14px",
                                                    borderRadius: 14,
                                                    border: `1px solid ${C.line}`,
                                                    color: C.ink,
                                                    fontWeight: 600,
                                                    fontSize: 14,
                                                    background: "#fff",
                                                }}
                                            >
                                                Haritada Aç
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SEKME: VARDİYA & ÇALIŞMA SAATLERİ */}
                {tab === "shift" && (
                    <div style={{ marginTop: 22 }}>
                        <div className="dr-head">OTOMATİK VARDİYA</div>
                        <h1 style={{ margin: "4px 0 16px", fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em" }}>
                            Çalışma Saatleri
                        </h1>

                        <div className="dr-grid">
                            {/* Sol kart: Günlük aç/kapat */}
                            <div className="dr-white" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>Bugünlük Durum</div>
                                        <span
                                            style={{
                                                fontFamily: MONO,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: "4px 9px",
                                                borderRadius: 999,
                                                background: isPaused ? "rgba(179,38,30,0.1)" : "rgba(14,138,95,0.12)",
                                                color: isPaused ? "#B3261E" : C.ok,
                                            }}
                                        >
                                            {isPaused ? "KAPALI" : "AÇIK"}
                                        </span>
                                    </div>
                                    <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5, color: C.ink2 }}>
                                        Bugün çalışmayacaksan tek dokunuşla kapatabilirsin. Yarın belirlediğin vardiya saatinde (<b>{shiftStart}</b>) sistem seni otomatik olarak tekrar aktif eder.
                                    </p>
                                    {isPaused && driver?.pausedUntil && (
                                        <div
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: 12,
                                                background: "rgba(245,184,0,0.12)",
                                                fontSize: 12.5,
                                                fontFamily: MONO,
                                            }}
                                        >
                                            Otomatik açılış: {new Date(driver.pausedUntil).toLocaleString("tr-TR")}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    disabled={saving || !driver}
                                    onClick={togglePauseToday}
                                    className="dr-btn"
                                    style={{
                                        marginTop: 16,
                                        width: "100%",
                                        background: isPaused ? C.ok : C.ink,
                                    }}
                                >
                                    {isPaused ? "Şimdi Tekrar Aktif Et" : "Bugünlük Kapat (Yarın Otomatik Aç)"}
                                </button>
                            </div>

                            {/* Sağ kart: Saat aralığı */}
                            <div className="dr-white" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
                                        Günlük Mesai Aralığı
                                    </div>
                                    <p style={{ margin: "0 0 14px", fontSize: 13.5, color: C.ink2 }}>
                                        Bu saatler arasında siteye girmeden otomatik aktif olursun (gece vardiyası desteklenir).
                                    </p>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            border: `1px solid ${C.line}`,
                                            borderRadius: 14,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <label style={{ padding: "10px 12px", display: "block" }}>
                                            <div className="dr-head">Başlangıç</div>
                                            <input
                                                type="time"
                                                value={shiftStart}
                                                onChange={(e) => setShiftStart(e.target.value)}
                                                style={{
                                                    marginTop: 4,
                                                    width: "100%",
                                                    border: 0,
                                                    outline: "none",
                                                    fontFamily: MONO,
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    background: "transparent",
                                                }}
                                            />
                                        </label>
                                        <label style={{ padding: "10px 12px", borderLeft: `1px solid ${C.line}`, display: "block" }}>
                                            <div className="dr-head">Bitiş</div>
                                            <input
                                                type="time"
                                                value={shiftEnd}
                                                onChange={(e) => setShiftEnd(e.target.value)}
                                                style={{
                                                    marginTop: 4,
                                                    width: "100%",
                                                    border: 0,
                                                    outline: "none",
                                                    fontFamily: MONO,
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    background: "transparent",
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={saving || !driver}
                                    onClick={saveSchedule}
                                    className="dr-btn"
                                    style={{
                                        marginTop: 16,
                                        width: "100%",
                                        boxShadow: "rgba(58,58,244,0.18) 0 0 0 4px",
                                    }}
                                >
                                    Saatleri Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SEKME: KAZANÇ ÖZETİ (Admin analitikteki beyaz fiş kart formatıyla aynı) */}
                {tab === "earnings" && (
                    <div style={{ marginTop: 22 }}>
                        <div className="dr-head">GÜNLÜK ÖZET</div>
                        <h1 style={{ margin: "4px 0 16px", fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em" }}>
                            Kazanç & Yolculuklar
                        </h1>
                        <div className="dr-white" style={{ maxWidth: 440 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <div>
                                    <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 500, letterSpacing: "-0.04em" }}>
                                        ₺{(myRides.length * 200).toLocaleString("tr-TR")}
                                    </span>{" "}
                                    <span style={{ fontSize: 13, color: C.ink2 }}>tahmini ciro</span>
                                </div>
                                <span style={{ fontFamily: MONO, fontSize: 13 }}>{myRides.length} çağrı</span>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    border: `1px solid ${C.line}`,
                                    borderRadius: 14,
                                    marginTop: 14,
                                    overflow: "hidden",
                                }}
                            >
                                <div style={{ padding: "9px 12px" }}>
                                    <div className="dr-head">Nakit</div>
                                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, marginTop: 2 }}>{cashCount} çağrı</div>
                                </div>
                                <div style={{ padding: "9px 12px", borderLeft: `1px solid ${C.line}` }}>
                                    <div className="dr-head">Cüzdan</div>
                                    <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, marginTop: 2 }}>{walletCount} çağrı</div>
                                </div>
                            </div>

                            <div style={{ height: 1, background: C.line, margin: "14px 0 8px" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0" }}>
                                <span style={{ color: C.ink2 }}>Brüt Tutar</span>
                                <span style={{ fontFamily: MONO }}>₺{(myRides.length * 200).toLocaleString("tr-TR")}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0" }}>
                                <span style={{ color: C.ink2 }}>Platform Komisyonu (%15)</span>
                                <span style={{ fontFamily: MONO }}>-₺{Math.round(myRides.length * 200 * 0.15).toLocaleString("tr-TR")}</span>
                            </div>
                            <div style={{ height: 1, background: C.line, margin: "8px 0 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600, padding: "12px 0 0" }}>
                                <span>Net Kazanç</span>
                                <span style={{ fontFamily: MONO }}>₺{Math.round(myRides.length * 200 * 0.85).toLocaleString("tr-TR")}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
