import * as React from "react"
import { useEffect, useRef, useState } from "react"
import AuthPage, { AuthUser, TOKEN_KEY } from "../auth/AuthPage"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    accent: "#3A3AF4",
    ok: "#0E8A5F",
    danger: "#B3261E",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const YANDEX_API_KEY = "143da0f6-8fd6-4fec-a256-0e896c7cff60"

function getApiUrl() {
    const envUrl = (import.meta as any).env?.VITE_API_URL
    if (envUrl) return String(envUrl).replace(/\/$/, "")
    const h = window.location.hostname
    if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
        return `http://${h}:5080`
    return "https://api.paytaksi.com.tr"
}

function cleanPhoneHref(phone?: string | null) {
    if (!phone) return "#"
    const digits = phone.replace(/\D/g, "")
    if (digits.startsWith("90")) return `tel:+${digits}`
    if (digits.startsWith("0")) return `tel:+90${digits.slice(1)}`
    return `tel:${digits}`
}

export default function RideCompletePage() {
    const params = new URLSearchParams(window.location.search)
    const rideId = Number(params.get("id") || 0)

    const [ride, setRide] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [infoMsg, setInfoMsg] = useState<string | null>(null)
    const [driverCoord, setDriverCoord] = useState<[number, number] | null>(null)
    const [driverUser, setDriverUser] = useState<AuthUser | null>(null)
    const [nowMs, setNowMs] = useState(() => Date.now())

    useEffect(() => {
        const t = setInterval(() => setNowMs(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    const mapRef = useRef<HTMLDivElement>(null)
    const ymapInstanceRef = useRef<any>(null)
    const driverPinRef = useRef<any>(null)
    const driverCoordRef = useRef<[number, number] | null>(null)
    const lastSentRef = useRef(0)

    const authHeaders = (): Record<string, string> => {
        const token = localStorage.getItem(TOKEN_KEY)
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const loadRide = async (silent = false) => {
        if (!rideId) return
        try {
            const r = await fetch(`${getApiUrl()}/api/rides/${rideId}`, { headers: authHeaders() })
            if (r.status === 401) {
                setDriverUser(null)
                return
            }
            const data = await r.json().catch(() => null)
            if (!r.ok) {
                if (!silent) setErr(data?.error || "Bu yolculuk kaydı bulunamadı.")
                return
            }
            setRide(data)
        } catch {
            if (!silent) setErr("Sunucuya bağlanılamadı.")
        }
    }

    // Giriş yapıldıktan sonra çağrıyı yükle ve durumu canlı izle (zaman aşımı / otomatik tamamlanma için)
    useEffect(() => {
        if (!driverUser) return
        if (!rideId) {
            setErr("Geçersiz yolculuk bağlantısı.")
            setLoading(false)
            return
        }
        loadRide().finally(() => setLoading(false))
        const t = setInterval(() => loadRide(true), 5000)
        return () => clearInterval(t)
    }, [driverUser, rideId])

    // Kabul sonrası: sürücü konumunu canlı takip et ve sunucuya gönder (müşteri takibi + otomatik tamamlama)
    const activeNow = ride?.status === "Yolculukta"
    useEffect(() => {
        if (!driverUser || !activeNow || !navigator.geolocation) return
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const c: [number, number] = [pos.coords.latitude, pos.coords.longitude]
                setDriverCoord(c)
                const now = Date.now()
                if (now - lastSentRef.current < 4000) return
                lastSentRef.current = now
                fetch(`${getApiUrl()}/api/rides/${rideId}/location`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeaders() },
                    body: JSON.stringify({ lat: c[0], lng: c[1] }),
                })
                    .then((r) => (r.ok ? r.json() : null))
                    .then((d) => {
                        if (d?.status) setRide((prev: any) => (prev ? { ...prev, status: d.status, pickedUp: d.pickedUp } : prev))
                    })
                    .catch(() => {})
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
        )
        return () => navigator.geolocation.clearWatch(id)
    }, [driverUser, activeNow, rideId])

    useEffect(() => {
        driverCoordRef.current = driverCoord
        const ym = (window as any).ymaps
        if (!driverCoord || !ym || !ymapInstanceRef.current) return
        if (driverPinRef.current) {
            driverPinRef.current.geometry.setCoordinates(driverCoord)
        }
    }, [driverCoord?.[0], driverCoord?.[1]])

    useEffect(() => {
        if (!document.getElementById("staysift-fonts")) {
            const l = document.createElement("link")
            l.id = "staysift-fonts"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            document.head.appendChild(l)
        }

        // Sürücünün kendi GPS konumunu al
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setDriverCoord([pos.coords.latitude, pos.coords.longitude])
                },
                () => {},
                { enableHighAccuracy: true, timeout: 8000 }
            )
        }

    }, [])

    // Yandex Harita: Alınış + Varış + Sürücünün Kendi Konumu + OSRM Yol Rotası
    useEffect(() => {
        if (!ride || !mapRef.current) return
        let cancelled = false

        const pickup: [number, number] = [
            Number(ride.pickupLat) || 38.6748,
            Number(ride.pickupLng) || 39.2225,
        ]
        const hasDest = Boolean(ride.destinationLat && ride.destinationLng)
        const dest: [number, number] | null = hasDest
            ? [Number(ride.destinationLat), Number(ride.destinationLng)]
            : null

        const initMap = () => {
            if (cancelled || !mapRef.current) return
            const ym = (window as any).ymaps
            if (!ym) return

            ym.ready(async () => {
                if (cancelled || !mapRef.current) return
                if (ymapInstanceRef.current) {
                    try {
                        ymapInstanceRef.current.destroy()
                    } catch {}
                    ymapInstanceRef.current = null
                }

                const map = new ym.Map(
                    mapRef.current,
                    {
                        center: pickup,
                        zoom: 14,
                        controls: ["zoomControl"],
                    },
                    { suppressMapOpenBlock: true }
                )
                ymapInstanceRef.current = map

                const makePin = (label: string, bg: string, fg: string, dot: string) =>
                    ym.templateLayoutFactory.createClass(
                        `<div style="position:relative;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:none;">
                            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;border-radius:999px;background:${bg};color:${fg};font-family:'Inter Tight',system-ui,sans-serif;font-size:11.5px;font-weight:700;white-space:nowrap;box-shadow:0 8px 20px -6px rgba(16,17,24,0.4);border:1px solid rgba(255,255,255,0.28);">
                                <span style="width:7px;height:7px;border-radius:99px;background:${dot};display:inline-block;"></span>
                                <span>${label}</span>
                            </div>
                            <div style="width:2px;height:7px;background:${dot};"></div>
                            <div style="width:12px;height:12px;border-radius:99px;background:${dot};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
                        </div>`
                    )

                const points: [number, number][] = [pickup]

                // 1. Müşteri Alınış Pini (Mavi)
                map.geoObjects.add(
                    new ym.Placemark(
                        pickup,
                        {},
                        { iconLayout: makePin("Alınış", "rgba(255,255,255,0.96)", "#101114", "#3A3AF4"), zIndex: 1200 }
                    )
                )

                // 2. Varış Pini (Siyah)
                if (dest) {
                    points.push(dest)
                    map.geoObjects.add(
                        new ym.Placemark(
                            dest,
                            {},
                            { iconLayout: makePin("Varış", "rgba(16,17,20,0.94)", "#ffffff", "#101114"), zIndex: 1200 }
                        )
                    )
                }

                // 3. Sürücünün Kendi Konumu (Yeşil)
                const dc = driverCoordRef.current
                driverPinRef.current = null
                if (dc) {
                    points.push(dc)
                    const pin = new ym.Placemark(
                        dc,
                        {},
                        { iconLayout: makePin("Konumunuz", "rgba(14,138,95,0.95)", "#ffffff", "#0E8A5F"), zIndex: 1300 }
                    )
                    driverPinRef.current = pin
                    map.geoObjects.add(pin)
                }

                // 4. Alınış -> Varış Gerçek Yol Rotası (OSRM)
                if (dest) {
                    try {
                        const rRes = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`
                        )
                        if (rRes.ok && !cancelled) {
                            const rData = await rRes.json()
                            const coords = rData?.routes?.[0]?.geometry?.coordinates
                            if (Array.isArray(coords) && coords.length > 1) {
                                const lineCoords = coords.map((p: [number, number]) => [p[1], p[0]])
                                map.geoObjects.add(
                                    new ym.Polyline(
                                        lineCoords,
                                        {},
                                        { strokeColor: "#3A3AF4", strokeWidth: 4, strokeOpacity: 0.85 }
                                    )
                                )
                            }
                        }
                    } catch {}
                }

                // Tüm pinleri haritaya sığdır
                if (points.length > 1) {
                    const lats = points.map((p) => p[0])
                    const lngs = points.map((p) => p[1])
                    const bounds = [
                        [Math.min(...lats) - 0.004, Math.min(...lngs) - 0.004],
                        [Math.max(...lats) + 0.004, Math.max(...lngs) + 0.004],
                    ]
                    map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 24 })
                }
            })
        }

        if ((window as any).ymaps) {
            initMap()
        } else {
            const s = document.createElement("script")
            s.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=tr_TR`
            s.onload = initMap
            document.head.appendChild(s)
        }

        return () => {
            cancelled = true
            if (ymapInstanceRef.current) {
                try {
                    ymapInstanceRef.current.destroy()
                } catch {}
                ymapInstanceRef.current = null
            }
        }
    }, [ride?.id, !!driverCoord])

    const callAction = async (action: "accept" | "reject" | "complete" | "cancel") => {
        if (!rideId || busy) return
        setBusy(true)
        setErr(null)
        setInfoMsg(null)
        try {
            const res = await fetch(`${getApiUrl()}/api/rides/${rideId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: action === "cancel" ? JSON.stringify({ reason: "Müşteriye ulaşılamadı" }) : undefined,
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setErr(data.error || "İşlem gerçekleştirilemedi.")
                return
            }
            if (action === "accept") {
                setRide((prev: any) => (prev ? { ...prev, status: "Yolculukta", customerPhone: data.customerPhone } : prev))
                setInfoMsg(data.message || "Çağrı kabul edildi! Müşteriyi hemen arayabilirsiniz.")
            } else if (action === "reject") {
                setRide((prev: any) => (prev ? { ...prev, status: "Reddedildi", customerPhone: null } : prev))
                setInfoMsg(data.message || "Çağrı reddedildi.")
            } else if (action === "cancel") {
                setRide((prev: any) => (prev ? { ...prev, status: "İptal Edildi" } : prev))
                setInfoMsg(data.message || "Yolculuk iptal edildi.")
            } else if (action === "complete") {
                setRide((prev: any) => (prev ? { ...prev, status: "Tamamlandı" } : prev))
                setInfoMsg(data.message || "Yolculuk tamamlandı! Durumunuz tekrar Müsait.")
            }
        } catch {
            setErr("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.")
        } finally {
            setBusy(false)
        }
    }

    if (!driverUser) {
        // Sürücü giriş yapmamışsa önce giriş ister; giriş sonrası çağrı otomatik açılır
        return <AuthPage initialMode="login" requireRole="Taksici" onAuthenticated={(u) => setDriverUser(u)} />
    }

    const status = String(ride?.status || "")
    const isPending = status === "Onay Bekliyor" || status === "Sürücüye İletildi" || status === "Bekliyor"
    const isActiveRide = status === "Yolculukta" || status === "Yolculukta (Meşgul)"
    const isCompleted = status === "Tamamlandı"
    const isCancelled = status === "İptal Edildi"
    // Reddedildi / başka sürücüye aktarıldı / hizmet verilemedi: bu sürücü için çağrı kapandı
    const isRejected = status === "Reddedildi" || status === "Hizmet Verilemedi"
    const isHandedOver = !!ride && !isPending && !isActiveRide && !isCompleted && !isCancelled && !isRejected
    const price = Number(ride?.estimatedPrice || 250)
    const cleanDest = String(ride?.destinationAddress || "").replace(/\s*\(https?:\/\/[^)]+\)/g, "").trim()
    const pickupNavUrl =
        ride?.pickupLat && ride?.pickupLng
            ? `https://www.google.com/maps/dir/?api=1&destination=${ride.pickupLat},${ride.pickupLng}`
            : null


    const CSS = `
        @keyframes ptIn { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes ptPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.55) } 100% { box-shadow: 0 0 0 7px rgba(34,197,94,0) } }
        .pt-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
          font-family: ${SANS}; color: ${C.ink};
          background: radial-gradient(70% 50% at 85% 0%, rgba(58,58,244,0.16), rgba(58,58,244,0) 70%), radial-gradient(60% 45% at 0% 100%, rgba(14,138,95,0.10), rgba(14,138,95,0) 70%), ${C.bg}; }
        .pt-card { position: relative; isolation: isolate; overflow: hidden; width: 100%; max-width: 440px; box-sizing: border-box;
          padding: 22px; border-radius: 30px;
          background: linear-gradient(155deg, rgba(255,255,255,0.74) 0%, rgba(247,247,250,0.52) 48%, rgba(236,237,243,0.44) 100%);
          backdrop-filter: blur(40px) saturate(190%) brightness(1.04); -webkit-backdrop-filter: blur(40px) saturate(190%) brightness(1.04);
          border: 1px solid rgba(255,255,255,0.78);
          box-shadow: 0 40px 100px -24px rgba(16,17,24,0.45), 0 12px 30px -12px rgba(16,17,24,0.18), 0 0 0 0.5px rgba(16,17,20,0.08), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35);
          animation: ptIn .45s cubic-bezier(.2,.8,.2,1) both; }
        .pt-card::after { content: ""; position: absolute; inset: 0 0 52% 0; z-index: -1; pointer-events: none; background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0)); }
        .pt-glow { position: absolute; z-index: -1; pointer-events: none; width: 300px; height: 300px; top: -150px; right: -110px; border-radius: 50%; background: radial-gradient(circle, rgba(58,58,244,0.22), rgba(58,58,244,0) 65%); }
        .pt-ic { width: 46px; height: 46px; flex: none; border-radius: 15px; display: grid; place-items: center; color: ${C.accent};
          background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(58,58,244,0.10)); border: 1px solid rgba(255,255,255,0.9);
          box-shadow: inset 0 1px 0 #fff, 0 6px 16px -6px rgba(58,58,244,0.35); }
        .pt-ic-ok { color: #16a34a; background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(34,197,94,0.16)); box-shadow: inset 0 1px 0 #fff, 0 10px 24px -8px rgba(34,197,94,0.45); }
        .pt-ic-bad { color: ${C.danger}; background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(179,38,30,0.14)); }
        .pt-eyebrow { display: flex; align-items: center; gap: 7px; font-family: ${MONO}; font-size: 11px; color: ${C.ink2}; letter-spacing: 0.01em; }
        .pt-live { width: 7px; height: 7px; border-radius: 99px; background: #22c55e; flex: none; animation: ptPulse 1.6s ease-out infinite; }
        .pt-tile { display: block; border-radius: 18px; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.88);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.04), 0 8px 20px -14px rgba(16,17,20,0.18); }
        .pt-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6D75; }
        .pt-stop { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
        .pt-place { font-size: 14.5px; font-weight: 600; letter-spacing: -0.015em; margin-top: 1px; }
        .pt-dot { width: 10px; height: 10px; flex: none; border-radius: 99px; background: ${C.accent}; box-shadow: 0 0 0 4px rgba(58,58,244,0.14); }
        .pt-dot-end { border-radius: 3px; background: ${C.ink}; box-shadow: 0 0 0 4px rgba(16,17,20,0.08); }
        .pt-link { margin: -6px 0 -6px 4.5px; height: 14px; border-left: 1.5px dashed rgba(16,17,20,0.2); }
        .pt-pill { display: inline-flex; align-items: center; gap: 6px; flex: none; padding: 7px 12px; border-radius: 999px; font-size: 12.5px; color: ${C.ink}; background: rgba(58,58,244,0.08); border: 1px solid rgba(58,58,244,0.16); }
        .pt-pill b { font-family: ${MONO}; font-weight: 600; color: ${C.accent}; }
        .pt-primary { position: relative; overflow: hidden; width: 100%; border: 0; cursor: pointer; text-decoration: none; box-sizing: border-box;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 14px 15px 18px; border-radius: 18px;
          font-family: ${SANS}; font-size: 15px; font-weight: 700; color: #fff;
          background: linear-gradient(180deg, #5050FF 0%, ${C.accent} 55%, #2E2EDC 100%);
          box-shadow: 0 14px 30px -10px rgba(58,58,244,0.6), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15);
          transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s; }
        .pt-primary::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); transform: skewX(-20deg); transition: left .7s ease; }
        .pt-primary:hover { transform: translateY(-1px); }
        .pt-primary:hover::after { left: 130%; }
        .pt-primary:active { transform: scale(.985); }
        .pt-primary:disabled { opacity: .7; cursor: wait; }
        .pt-ok { background: linear-gradient(180deg, #19A877 0%, ${C.ok} 55%, #0A7350 100%); box-shadow: 0 14px 30px -10px rgba(14,138,95,0.6), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15); }
        .pt-badge { flex: none; font-family: ${MONO}; font-size: 13px; font-weight: 600; padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,0.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3); }
        .pt-ghost { width: 100%; box-sizing: border-box; cursor: pointer; text-decoration: none; display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 14px 16px; border-radius: 16px; font-family: ${SANS}; font-size: 14px; font-weight: 600; color: ${C.ink};
          background: rgba(255,255,255,0.42); border: 1px solid rgba(255,255,255,0.85); box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.05);
          transition: background .2s, transform .2s; }
        .pt-ghost:hover { background: rgba(255,255,255,0.72); }
        .pt-ghost:active { transform: scale(.985); }
        .pt-ghost:disabled { opacity: .6; cursor: wait; }
        .pt-ghost-bad { color: ${C.danger}; }
        .pt-divider { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #8E9099; }
        .pt-divider::before, .pt-divider::after { content: ""; flex: 1; height: 1px; background: rgba(16,17,20,0.08); }
        .pt-note { margin: 0; padding: 10px 12px; border-radius: 14px; font-size: 13px; font-weight: 600; line-height: 1.4; }
        @media (max-width: 700px) { .pt-card { padding: 18px 15px 16px; border-radius: 26px; } }
    `
    const Arrow = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    )
    const headIcon = isCompleted ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    ) : isRejected ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16" /><rect x="3.5" y="16" width="17" height="4" rx="1.5" /><path d="M9.5 6h5" />
        </svg>
    )

    return (
        <div className="pt-page">
            <style>{CSS}</style>
            <div className="pt-card">
                <span className="pt-glow" aria-hidden="true" />

                {/* Başlık */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={"pt-ic" + (isCompleted ? " pt-ic-ok" : isRejected ? " pt-ic-bad" : "")}>{headIcon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="pt-eyebrow">
                            <span className="pt-live" />
                            PayTaksi çağrı · #{rideId || "-"}
                            {ride?.isShared ? ` · Paylaşımlı (${ride.passengerCount || 1} kişi)` : ""}
                            {ride?.scheduledAt ? ` · Randevu ${new Date(ride.scheduledAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : ""}
                        </div>
                        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                            {isCompleted ? "Yolculuk tamamlandı" : isCancelled ? "Yolculuk iptal edildi" : isRejected ? "Çağrı kapandı" : isHandedOver ? "Çağrı başka sürücüde" : isActiveRide ? (ride?.pickedUp ? "Yolcu araçta" : "Yolcuya gidiyorsunuz") : "Yeni taksi çağrısı"}
                        </div>
                    </div>
                    {ride && (
                        <span className="pt-pill">
                            <b>{Math.round(price)} TL</b>
                            <span style={{ color: C.ink2, fontWeight: 600 }}>{ride.paymentType || "Nakit"}</span>
                        </span>
                    )}
                </div>

                {loading ? (
                    <p style={{ margin: "20px 0 4px", fontSize: 14, color: C.ink2 }}>Çağrı bilgileri yükleniyor...</p>
                ) : err && !ride ? (
                    <p className="pt-note" style={{ marginTop: 16, background: "rgba(179,38,30,0.08)", color: C.danger }}>{err}</p>
                ) : (
                    <>
                        {/* Harita */}
                        <div className="pt-tile" style={{ marginTop: 16, height: 210, overflow: "hidden", position: "relative", background: "#E8E5DD" }}>
                            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                        </div>

                        {/* Güzergâh */}
                        <div className="pt-tile" style={{ marginTop: 12, padding: "4px 14px" }}>
                            <div className="pt-stop">
                                <span className="pt-dot" />
                                <div style={{ minWidth: 0 }}>
                                    <div className="pt-label">Müşteri alınış</div>
                                    <div className="pt-place">{ride?.pickupAddress}</div>
                                </div>
                            </div>
                            <div className="pt-link" />
                            <div className="pt-stop">
                                <span className="pt-dot pt-dot-end" />
                                <div style={{ minWidth: 0 }}>
                                    <div className="pt-label">Varış noktası</div>
                                    <div className="pt-place">{cleanDest}</div>
                                </div>
                            </div>
                        </div>

                        {err && <p className="pt-note" style={{ marginTop: 10, background: "rgba(179,38,30,0.08)", color: C.danger }}>{err}</p>}
                        {infoMsg && <p className="pt-note" style={{ marginTop: 10, background: "rgba(14,138,95,0.10)", color: C.ok }}>{infoMsg}</p>}

                        {/* Onay bekliyor */}
                        {isPending && (() => {
                            const rawTs = ride?.dispatchedAt || ride?.createdAt
                            let baseTs = nowMs
                            if (typeof rawTs === "string" && rawTs.length > 0) {
                                const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(rawTs)
                                const localParsed = new Date(rawTs).getTime()
                                const utcParsed = hasTz ? localParsed : new Date(rawTs + "Z").getTime()
                                // AWS sunucusu UTC, yerel Windows UTC+3: şu ana en yakın geçerli zamanı seç
                                const dLocal = Number.isFinite(localParsed) ? Math.abs(nowMs - localParsed) : Infinity
                                const dUtc = Number.isFinite(utcParsed) ? Math.abs(nowMs - utcParsed) : Infinity
                                baseTs = dUtc < dLocal ? utcParsed : localParsed
                                if (!Number.isFinite(baseTs)) baseTs = nowMs
                            }
                            const remainSec = Math.max(0, 120 - Math.max(0, Math.floor((nowMs - baseTs) / 1000)))
                            const mm = String(Math.floor(remainSec / 60)).padStart(2, "0")
                            const ss = String(remainSec % 60).padStart(2, "0")
                            const pct = Math.min(100, Math.max(0, (remainSec / 120) * 100))
                            const urgent = remainSec <= 30
                            return (
                                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div
                                        className="pt-tile"
                                        style={{
                                            padding: "10px 14px",
                                            background: urgent ? "rgba(179,38,30,0.08)" : "rgba(58,58,244,0.07)",
                                            border: `1px solid ${urgent ? "rgba(179,38,30,0.22)" : "rgba(58,58,244,0.18)"}`,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600 }}>
                                            <span style={{ color: urgent ? C.danger : C.ink2 }}>
                                                {remainSec > 0 ? "Onay için kalan süre" : "Onay süresi doldu"}
                                            </span>
                                            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: urgent ? C.danger : C.accent }}>
                                                {mm}:{ss}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: 7, height: 5, borderRadius: 99, background: "rgba(16,17,20,0.08)", overflow: "hidden" }}>
                                            <div
                                                style={{
                                                    width: `${pct}%`,
                                                    height: "100%",
                                                    borderRadius: 99,
                                                    background: urgent ? C.danger : C.accent,
                                                    transition: "width .8s linear",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" className="pt-primary pt-ok" disabled={busy} onClick={() => callAction("accept")}>
                                        <span>{busy ? "İşleniyor..." : "Çağrıyı kabul et"}</span>
                                        <span className="pt-badge">{Math.round(price)} TL</span>
                                    </button>
                                    <div className="pt-divider">veya</div>
                                    <button type="button" className="pt-ghost pt-ghost-bad" disabled={busy} onClick={() => callAction("reject")}>
                                        <span>Reddet</span>
                                    </button>
                                    <p style={{ margin: 0, fontSize: 12, color: C.ink2, textAlign: "center" }}>
                                        Müşteri telefonu, çağrıyı kabul ettiğinizde açılır.
                                    </p>
                                </div>
                            )
                        })()}

                        {/* Aktif yolculuk */}
                        {isActiveRide && (
                            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                                <div className="pt-tile" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                    <div>
                                        <div className="pt-label">Müşteri telefonu</div>
                                        <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, marginTop: 2 }}>{ride?.customerPhone || "—"}</div>
                                    </div>
                                </div>
                                <a className="pt-primary" href={cleanPhoneHref(ride?.customerPhone)}>
                                    <span>Müşteriyi ara</span>
                                    <span className="pt-badge"><Arrow /></span>
                                </a>
                                {pickupNavUrl && (
                                    <a className="pt-ghost" href={pickupNavUrl} target="_blank" rel="noreferrer">
                                        <span>Alınış konumuna yol tarifi</span>
                                        <Arrow />
                                    </a>
                                )}
                                <button type="button" className="pt-primary pt-ok" disabled={busy} onClick={() => callAction("complete")}>
                                    <span>{busy ? "Tamamlanıyor..." : "Yolcuyu bıraktım · Bitir"}</span>
                                    <span className="pt-badge"><Arrow /></span>
                                </button>
                                {!ride?.pickedUp && (
                                    <button type="button" className="pt-ghost pt-ghost-bad" disabled={busy} onClick={() => callAction("cancel")}>
                                        <span>Müşteriye ulaşamadım · İptal et</span>
                                    </button>
                                )}
                                <p style={{ margin: 0, fontSize: 12, color: C.ink2, textAlign: "center" }}>
                                    Konumunuz müşteriyle canlı paylaşılır. Varış noktasına ulaşınca yolculuk otomatik tamamlanır.
                                </p>
                            </div>
                        )}

                        {isCancelled && (
                            <p className="pt-note" style={{ marginTop: 14, textAlign: "center", background: "rgba(179,38,30,0.08)", color: C.danger }}>
                                Yolculuk iptal edildi. Bu yolculuk için ücret yansımaz.
                            </p>
                        )}
                        {(isRejected || isHandedOver) && (
                            <p className="pt-note" style={{ marginTop: 14, textAlign: "center", background: "rgba(16,17,20,0.05)", color: C.ink2 }}>
                                Bu çağrı artık size ait değil (reddedildi, süre doldu veya başka sürücüye aktarıldı).
                            </p>
                        )}

                        {isCompleted && (
                            <p className="pt-note" style={{ marginTop: 14, textAlign: "center", background: "rgba(14,138,95,0.10)", color: C.ok }}>
                                Yolculuk tamamlandı. Durumunuz tekrar <b>Müsait</b>.
                            </p>
                        )}
                    </>
                )}

                <div style={{ marginTop: 14, textAlign: "center" }}>
                    <a href="/surucu" style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2, textDecoration: "none" }}>
                        Sürücü paneline git →
                    </a>
                </div>
            </div>
        </div>
    )
}
