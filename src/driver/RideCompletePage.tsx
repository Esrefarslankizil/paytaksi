import * as React from "react"
import { useEffect, useRef, useState } from "react"

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

    const mapRef = useRef<HTMLDivElement>(null)
    const ymapInstanceRef = useRef<any>(null)

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

        if (!rideId) {
            setErr("Geçersiz yolculuk bağlantısı.")
            setLoading(false)
            return
        }

        fetch(`${getApiUrl()}/api/rides/${rideId}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) setErr("Bu yolculuk kaydı bulunamadı.")
                else setRide(data)
            })
            .catch(() => setErr("Sunucuya bağlanılamadı."))
            .finally(() => setLoading(false))
    }, [rideId])

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
                if (driverCoord) {
                    points.push(driverCoord)
                    map.geoObjects.add(
                        new ym.Placemark(
                            driverCoord,
                            {},
                            { iconLayout: makePin("Konumunuz", "rgba(14,138,95,0.95)", "#ffffff", "#0E8A5F"), zIndex: 1300 }
                        )
                    )
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
    }, [ride?.id, driverCoord?.[0], driverCoord?.[1]])

    const callAction = async (action: "accept" | "reject" | "complete") => {
        if (!rideId || busy) return
        setBusy(true)
        setErr(null)
        setInfoMsg(null)
        try {
            const res = await fetch(`${getApiUrl()}/api/rides/${rideId}/${action}`, {
                method: "POST",
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

    const status = String(ride?.status || "")
    const isPending = status === "Onay Bekliyor" || status === "Sürücüye İletildi" || status === "Bekliyor"
    const isActiveRide = status === "Yolculukta" || status === "Yolculukta (Meşgul)"
    const isCompleted = status === "Tamamlandı"
    const isRejected = status === "Reddedildi"
    const price = Number(ride?.estimatedPrice || 250)
    const cleanDest = String(ride?.destinationAddress || "").replace(/\s*\(https?:\/\/[^)]+\)/g, "").trim()
    const pickupNavUrl =
        ride?.pickupLat && ride?.pickupLng
            ? `https://www.google.com/maps/dir/?api=1&destination=${ride.pickupLat},${ride.pickupLng}`
            : null

    return (
        <div
            style={{
                minHeight: "100dvh",
                background: C.bg,
                fontFamily: SANS,
                color: C.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 460,
                    borderRadius: 28,
                    padding: "20px 20px 22px",
                    background: "rgba(255, 255, 255, 0.88)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.96)",
                    boxShadow: "0 30px 70px -24px rgba(16, 17, 24, 0.28), 0 0 0 1px rgba(16, 17, 20, 0.06)",
                }}
            >
                {/* Üst Başlık & Fiyat Rozeti */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isCompleted ? C.ok : isRejected ? C.danger : C.accent }}>
                            PAYTAKSİ ÇAĞRI · #{rideId || "-"}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 1 }}>
                            {isCompleted
                                ? "Yolculuk Tamamlandı"
                                : isRejected
                                  ? "Çağrı Reddedildi"
                                  : isActiveRide
                                    ? "Yolculuk Aktif"
                                    : "Yeni Taksi Çağrısı"}
                        </div>
                    </div>
                    {ride && (
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: "-0.04em" }}>
                                {Math.round(price)} TL
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>{ride.paymentType || "Nakit"}</div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <p style={{ margin: "22px 0 6px", fontSize: 14, color: C.ink2 }}>Çağrı bilgileri yükleniyor...</p>
                ) : err && !ride ? (
                    <div
                        style={{
                            marginTop: 16,
                            padding: "12px 14px",
                            borderRadius: 14,
                            background: "rgba(179, 38, 30, 0.08)",
                            color: C.danger,
                            fontSize: 13.5,
                            fontWeight: 600,
                        }}
                    >
                        {err}
                    </div>
                ) : (
                    <>
                        {/* Canlı Harita: Sürücü Konumu + Alınış + Varış */}
                        <div
                            style={{
                                marginTop: 14,
                                height: 220,
                                borderRadius: 18,
                                overflow: "hidden",
                                border: "1px solid rgba(16, 17, 20, 0.09)",
                                background: "#E8E5DD",
                                position: "relative",
                            }}
                        >
                            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                        </div>

                        {/* Güzergâh Bilgisi */}
                        <div
                            style={{
                                marginTop: 12,
                                padding: "12px 14px",
                                borderRadius: 16,
                                background: "rgba(16, 17, 20, 0.035)",
                                border: "1px solid rgba(16, 17, 20, 0.07)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 9,
                                fontSize: 13.5,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                                <span style={{ width: 9, height: 9, borderRadius: 99, background: C.accent, marginTop: 5, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink2, textTransform: "uppercase" }}>Müşteri Alınış</div>
                                    <div style={{ fontWeight: 600, color: C.ink }}>{ride?.pickupAddress}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, borderTop: "1px solid rgba(16,17,20,0.07)", paddingTop: 8 }}>
                                <span style={{ width: 9, height: 9, borderRadius: 3, background: C.ink, marginTop: 5, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink2, textTransform: "uppercase" }}>Varış Noktası</div>
                                    <div style={{ fontWeight: 600, color: C.ink }}>{cleanDest}</div>
                                </div>
                            </div>
                        </div>

                        {err && (
                            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(179,38,30,0.08)", color: C.danger, fontSize: 13, fontWeight: 600 }}>
                                {err}
                            </div>
                        )}
                        {infoMsg && (
                            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(14,138,95,0.10)", color: C.ok, fontSize: 13, fontWeight: 600 }}>
                                {infoMsg}
                            </div>
                        )}

                        {/* 1. ONAY BEKLİYOR: Kabul Et / Reddet */}
                        {isPending && (
                            <>
                                <div style={{ marginTop: 12, fontSize: 12, color: C.ink2, textAlign: "center" }}>
                                    Müşteri telefon numarası çağrıyı <b>Kabul Et</b> dediğinizde açılacaktır.
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10, marginTop: 12 }}>
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => callAction("reject")}
                                        style={{
                                            padding: "14px 12px",
                                            borderRadius: 16,
                                            border: "1px solid rgba(179, 38, 30, 0.28)",
                                            background: "rgba(179, 38, 30, 0.08)",
                                            color: C.danger,
                                            fontFamily: SANS,
                                            fontSize: 15,
                                            fontWeight: 700,
                                            cursor: busy ? "wait" : "pointer",
                                        }}
                                    >
                                        Reddet
                                    </button>
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => callAction("accept")}
                                        style={{
                                            padding: "14px 14px",
                                            borderRadius: 16,
                                            border: 0,
                                            background: C.ok,
                                            color: "#fff",
                                            fontFamily: SANS,
                                            fontSize: 15.5,
                                            fontWeight: 700,
                                            cursor: busy ? "wait" : "pointer",
                                            boxShadow: "0 14px 28px -10px rgba(14, 138, 95, 0.55)",
                                        }}
                                    >
                                        {busy ? "İşleniyor..." : "Kabul Et"}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* 2. KABUL EDİLDİ (YOLCULUKTA): Müşteri Numarası + Ara + Yol Tarifi + Bitir */}
                        {isActiveRide && (
                            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                                <div
                                    style={{
                                        padding: "13px 15px",
                                        borderRadius: 16,
                                        background: "rgba(58, 58, 244, 0.08)",
                                        border: "1px solid rgba(58, 58, 244, 0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>MÜŞTERİ TELEFONU</div>
                                        <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: C.ink, marginTop: 2 }}>
                                            {ride?.customerPhone || "—"}
                                        </div>
                                    </div>
                                    <a
                                        href={cleanPhoneHref(ride?.customerPhone)}
                                        style={{
                                            padding: "10px 16px",
                                            borderRadius: 12,
                                            background: C.accent,
                                            color: "#fff",
                                            textDecoration: "none",
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Müşteriyi Ara
                                    </a>
                                </div>

                                {pickupNavUrl && (
                                    <a
                                        href={pickupNavUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            padding: "12px 14px",
                                            borderRadius: 14,
                                            border: "1px solid rgba(16, 17, 20, 0.12)",
                                            background: "#fff",
                                            color: C.ink,
                                            textDecoration: "none",
                                            textAlign: "center",
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Alınış Konumuna Yol Tarifi Aç (Haritalar) →
                                    </a>
                                )}

                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => callAction("complete")}
                                    style={{
                                        width: "100%",
                                        padding: "15px 18px",
                                        borderRadius: 16,
                                        border: 0,
                                        background: C.ok,
                                        color: "#fff",
                                        fontFamily: SANS,
                                        fontSize: 15.5,
                                        fontWeight: 700,
                                        cursor: busy ? "wait" : "pointer",
                                        boxShadow: "0 14px 28px -10px rgba(14, 138, 95, 0.55)",
                                    }}
                                >
                                    {busy ? "Tamamlanıyor..." : "Yolcuyu Bıraktım · Yolculuğu Bitir"}
                                </button>
                            </div>
                        )}

                        {/* 3. TAMAMLANDI */}
                        {isCompleted && (
                            <div
                                style={{
                                    marginTop: 14,
                                    padding: "14px 16px",
                                    borderRadius: 16,
                                    background: "rgba(14, 138, 95, 0.10)",
                                    border: "1px solid rgba(14, 138, 95, 0.24)",
                                    color: C.ok,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    textAlign: "center",
                                }}
                            >
                                Yolculuk tamamlandı! Durumunuz tekrar <b>Müsait</b> olarak güncellendi.
                            </div>
                        )}
                    </>
                )}

                <div style={{ marginTop: 14, textAlign: "center" }}>
                    <a href="/surucu" style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2, textDecoration: "none" }}>
                        Sürücü Paneline Git →
                    </a>
                </div>
            </div>
        </div>
    )
}
