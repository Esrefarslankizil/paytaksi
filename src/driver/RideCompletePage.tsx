import * as React from "react"
import { useEffect, useState } from "react"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    accent: "#3A3AF4",
    ok: "#0E8A5F",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

function getApiUrl() {
    const envUrl = (import.meta as any).env?.VITE_API_URL
    if (envUrl) return String(envUrl).replace(/\/$/, "")
    const h = window.location.hostname
    if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
        return `http://${h}:5080`
    return "https://api.paytaksi.com.tr"
}

export default function RideCompletePage() {
    const params = new URLSearchParams(window.location.search)
    const rideId = Number(params.get("id") || 0)

    const [ride, setRide] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [done, setDone] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        if (!document.getElementById("staysift-fonts")) {
            const l = document.createElement("link")
            l.id = "staysift-fonts"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            document.head.appendChild(l)
        }
        if (!rideId) {
            setErr("Geçersiz yolculuk bağlantısı.")
            setLoading(false)
            return
        }
        fetch(`${getApiUrl()}/api/rides/${rideId}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) {
                    setErr("Bu yolculuk kaydı bulunamadı.")
                } else {
                    setRide(data)
                    if (data.status === "Tamamlandı") setDone(true)
                }
            })
            .catch(() => setErr("Sunucuya bağlanılamadı."))
            .finally(() => setLoading(false))
    }, [rideId])

    const handleComplete = async () => {
        if (!rideId || busy) return
        setBusy(true)
        setErr(null)
        try {
            const res = await fetch(`${getApiUrl()}/api/rides/${rideId}/complete`, {
                method: "POST",
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setErr(data.error || "Yolculuk tamamlanamadı.")
                return
            }
            setDone(true)
            setRide((prev: any) => (prev ? { ...prev, status: "Tamamlandı" } : prev))
        } catch {
            setErr("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.")
        } finally {
            setBusy(false)
        }
    }

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
                padding: 18,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 430,
                    borderRadius: 28,
                    padding: "26px 24px 24px",
                    background: "rgba(255, 255, 255, 0.86)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.96)",
                    boxShadow: "0 30px 70px -24px rgba(16, 17, 24, 0.28), 0 0 0 1px rgba(16, 17, 20, 0.06)",
                }}
            >
                {/* Logo & Üst Başlık */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            background: done ? "rgba(14, 138, 95, 0.12)" : "rgba(58, 58, 244, 0.10)",
                            color: done ? C.ok : C.accent,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                        }}
                    >
                        {done ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="10" width="18" height="7.5" rx="2.5" />
                                <path d="M6 10L8 5.5h8l2 4.5" />
                                <circle cx="7" cy="17.5" r="2" />
                                <circle cx="17" cy="17.5" r="2" />
                            </svg>
                        )}
                    </span>
                    <div>
                        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: done ? C.ok : C.accent }}>
                            PAYTAKSİ SÜRÜCÜ · #{rideId || "-"}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 1 }}>
                            {done ? "Yolculuk Tamamlandı" : "Yolculuğu Tamamla"}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p style={{ margin: "22px 0 6px", fontSize: 14, color: C.ink2 }}>Yolculuk bilgileri yükleniyor...</p>
                ) : err ? (
                    <div
                        style={{
                            marginTop: 18,
                            padding: "12px 14px",
                            borderRadius: 14,
                            background: "rgba(179, 38, 30, 0.08)",
                            color: "#B3261E",
                            fontSize: 13.5,
                            fontWeight: 600,
                        }}
                    >
                        {err}
                    </div>
                ) : (
                    <>
                        {/* Yolculuk Özet Kutusu */}
                        <div
                            style={{
                                marginTop: 18,
                                padding: "14px 16px",
                                borderRadius: 18,
                                background: "rgba(16, 17, 20, 0.035)",
                                border: "1px solid rgba(16, 17, 20, 0.07)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                fontSize: 13.5,
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase" }}>Alış</div>
                                <div style={{ fontWeight: 600, color: C.ink, marginTop: 2 }}>{ride?.pickupAddress}</div>
                            </div>
                            <div style={{ borderTop: "1px solid rgba(16,17,20,0.07)", paddingTop: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase" }}>Varış</div>
                                <div style={{ fontWeight: 600, color: C.ink, marginTop: 2, wordBreak: "break-word" }}>
                                    {String(ride?.destinationAddress || "").replace(/\s*\(https?:\/\/[^)]+\)/g, "")}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(16,17,20,0.07)", paddingTop: 8 }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2 }}>MÜŞTERİ</div>
                                    <div style={{ fontFamily: MONO, fontWeight: 600, marginTop: 2 }}>{ride?.customerPhone}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2 }}>DURUM</div>
                                    <div style={{ fontWeight: 700, color: done ? C.ok : "#B45309", marginTop: 2 }}>
                                        {done ? "Müsait (Tamamlandı)" : "Yolculukta (Meşgul)"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {done ? (
                            <div
                                style={{
                                    marginTop: 18,
                                    padding: "14px 16px",
                                    borderRadius: 16,
                                    background: "rgba(14, 138, 95, 0.10)",
                                    border: "1px solid rgba(14, 138, 95, 0.24)",
                                    color: C.ok,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    lineHeight: 1.5,
                                    textAlign: "center",
                                }}
                            >
                                Yolculuk başarıyla kapatıldı! Durumunuz tekrar <b>Müsait</b> olarak güncellendi, yeni çağrılar alabilirsiniz.
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handleComplete}
                                style={{
                                    marginTop: 18,
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
                                {busy ? "Onaylanıyor..." : "Yolcuyu Bıraktım · Yolculuğu Bitir"}
                            </button>
                        )}
                    </>
                )}

                <div style={{ marginTop: 16, textAlign: "center" }}>
                    <a href="/surucu" style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2, textDecoration: "none" }}>
                        Sürücü Paneline Git →
                    </a>
                </div>
            </div>
        </div>
    )
}
