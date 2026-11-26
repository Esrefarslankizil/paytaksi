import * as React from "react"
import { useEffect, useRef, useState } from "react"

const C = { bg: "#F1EFEA", ink: "#101114", ink2: "#55575E", accent: "#3A3AF4", ok: "#0E8A5F", danger: "#B3261E" }
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

function distKm(a: [number, number], b: [number, number]) {
    const R = 6371
    const dLat = ((b[0] - a[0]) * Math.PI) / 180
    const dLng = ((b[1] - a[1]) * Math.PI) / 180
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const CSS = `
@keyframes ptIn { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes ptPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.55) } 100% { box-shadow: 0 0 0 7px rgba(34,197,94,0) } }
.pt-page { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; font-family: ${SANS}; color: ${C.ink};
  background: radial-gradient(70% 50% at 85% 0%, rgba(58,58,244,0.16), rgba(58,58,244,0) 70%), radial-gradient(60% 45% at 0% 100%, rgba(14,138,95,0.10), rgba(14,138,95,0) 70%), ${C.bg}; }
.pt-card { position: relative; isolation: isolate; overflow: hidden; width: 100%; max-width: 440px; box-sizing: border-box; padding: 22px; border-radius: 30px;
  background: linear-gradient(155deg, rgba(255,255,255,0.74) 0%, rgba(247,247,250,0.52) 48%, rgba(236,237,243,0.44) 100%);
  backdrop-filter: blur(40px) saturate(190%); -webkit-backdrop-filter: blur(40px) saturate(190%);
  border: 1px solid rgba(255,255,255,0.78);
  box-shadow: 0 40px 100px -24px rgba(16,17,24,0.45), 0 12px 30px -12px rgba(16,17,24,0.18), 0 0 0 0.5px rgba(16,17,20,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
  animation: ptIn .45s cubic-bezier(.2,.8,.2,1) both; }
.pt-glow { position: absolute; z-index: -1; pointer-events: none; width: 300px; height: 300px; top: -150px; right: -110px; border-radius: 50%; background: radial-gradient(circle, rgba(58,58,244,0.22), rgba(58,58,244,0) 65%); }
.pt-ic { width: 46px; height: 46px; flex: none; border-radius: 15px; display: grid; place-items: center; color: ${C.accent};
  background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(58,58,244,0.10)); border: 1px solid rgba(255,255,255,0.9); box-shadow: inset 0 1px 0 #fff, 0 6px 16px -6px rgba(58,58,244,0.35); }
.pt-ic-ok { color: #16a34a; background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(34,197,94,0.16)); }
.pt-ic-bad { color: ${C.danger}; background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(179,38,30,0.14)); }
.pt-eyebrow { display: flex; align-items: center; gap: 7px; font-family: ${MONO}; font-size: 11px; color: ${C.ink2}; }
.pt-live { width: 7px; height: 7px; border-radius: 99px; background: #22c55e; flex: none; animation: ptPulse 1.6s ease-out infinite; }
.pt-tile { display: block; border-radius: 18px; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.88);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.04), 0 8px 20px -14px rgba(16,17,20,0.18); }
.pt-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6D75; }
.pt-stop { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.pt-place { font-size: 14.5px; font-weight: 600; letter-spacing: -0.015em; margin-top: 1px; }
.pt-dot { width: 10px; height: 10px; flex: none; border-radius: 99px; background: ${C.accent}; box-shadow: 0 0 0 4px rgba(58,58,244,0.14); }
.pt-dot-end { border-radius: 3px; background: ${C.ink}; box-shadow: 0 0 0 4px rgba(16,17,20,0.08); }
.pt-link { margin: -6px 0 -6px 4.5px; height: 14px; border-left: 1.5px dashed rgba(16,17,20,0.2); }
.pt-pill { display: inline-flex; align-items: center; gap: 6px; flex: none; padding: 7px 12px; border-radius: 999px; font-size: 12.5px; background: rgba(58,58,244,0.08); border: 1px solid rgba(58,58,244,0.16); }
.pt-pill b { font-family: ${MONO}; font-weight: 600; color: ${C.accent}; }
.pt-note { margin: 0; padding: 10px 12px; border-radius: 14px; font-size: 13px; font-weight: 600; line-height: 1.4; }
.pt-btn { display: block; text-align: center; text-decoration: none; padding: 14px 16px; border-radius: 16px; font-size: 14px; font-weight: 700; color: #fff;
  background: linear-gradient(180deg, #5050FF 0%, ${C.accent} 55%, #2E2EDC 100%); box-shadow: 0 14px 30px -10px rgba(58,58,244,0.6), inset 0 1px 0 rgba(255,255,255,0.35); }
`

export default function TrackPage() {
    const params = new URLSearchParams(window.location.search)
    const rideId = Number(params.get("id") || 0)
    const token = params.get("t") || ""

    const [ride, setRide] = useState<any>(null)
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const mapRef = useRef<HTMLDivElement>(null)
    const mapObj = useRef<any>(null)
    const driverPin = useRef<any>(null)
    const mapReadyFor = useRef<number>(0)

    useEffect(() => {
        if (!document.getElementById("staysift-fonts")) {
            const l = document.createElement("link")
            l.id = "staysift-fonts"
            l.rel = "stylesheet"
            l.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            document.head.appendChild(l)
        }
        if (!rideId || !token) {
            setErr("Geçersiz takip bağlantısı.")
            setLoading(false)
            return
        }
        let stop = false
        const load = async () => {
            try {
                const r = await fetch(`${getApiUrl()}/api/rides/${rideId}/track?t=${encodeURIComponent(token)}`)
                if (!r.ok) throw new Error()
                const d = await r.json()
                if (!stop) {
                    setRide(d)
                    setErr(null)
                }
            } catch {
                if (!stop && !ride) setErr("Yolculuk bilgisi alınamadı.")
            } finally {
                if (!stop) setLoading(false)
            }
        }
        load()
        const t = setInterval(load, 4000)
        return () => {
            stop = true
            clearInterval(t)
        }
    }, [rideId, token])

    const status: string = ride?.status || ""
    const isPending = status === "Onay Bekliyor"
    const isActive = status === "Yolculukta"
    const isDone = status === "Tamamlandı"
    const isCancelled = status === "İptal Edildi"
    const isNoService = status === "Hizmet Verilemedi"
    const showMap = isActive || isDone
    const pickup: [number, number] | null = ride?.pickupLat ? [Number(ride.pickupLat), Number(ride.pickupLng)] : null
    const dest: [number, number] | null = ride?.destinationLat ? [Number(ride.destinationLat), Number(ride.destinationLng)] : null
    const driverPos: [number, number] | null = ride?.driverLat ? [Number(ride.driverLat), Number(ride.driverLng)] : null

    // Harita bir kez kurulur; sürücü pini canlı hareket eder
    useEffect(() => {
        if (!ride || !showMap || !mapRef.current || !pickup) return
        if (mapReadyFor.current === ride.id && mapObj.current) return
        let cancelled = false
        const init = () => {
            const ym = (window as any).ymaps
            if (!ym || cancelled || !mapRef.current) return
            ym.ready(async () => {
                if (cancelled || !mapRef.current) return
                if (mapObj.current) {
                    try { mapObj.current.destroy() } catch {}
                }
                const map = new ym.Map(mapRef.current, { center: pickup, zoom: 14, controls: ["zoomControl"] }, { suppressMapOpenBlock: true })
                mapObj.current = map
                mapReadyFor.current = ride.id
                const pin = (label: string, bg: string, fg: string, dot: string) =>
                    ym.templateLayoutFactory.createClass(
                        `<div style="position:relative;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:none;">
                            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;border-radius:999px;background:${bg};color:${fg};font-family:'Inter Tight',system-ui,sans-serif;font-size:11.5px;font-weight:700;white-space:nowrap;box-shadow:0 8px 20px -6px rgba(16,17,24,0.4);border:1px solid rgba(255,255,255,0.28);">
                                <span style="width:7px;height:7px;border-radius:99px;background:${dot};display:inline-block;"></span><span>${label}</span></div>
                            <div style="width:2px;height:7px;background:${dot};"></div>
                            <div style="width:12px;height:12px;border-radius:99px;background:${dot};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div></div>`
                    )
                map.geoObjects.add(new ym.Placemark(pickup, {}, { iconLayout: pin("Alınış", "rgba(255,255,255,0.96)", "#101114", "#3A3AF4"), zIndex: 1200 }))
                if (dest) {
                    map.geoObjects.add(new ym.Placemark(dest, {}, { iconLayout: pin("Varış", "rgba(16,17,20,0.94)", "#fff", "#101114"), zIndex: 1200 }))
                    try {
                        const rr = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`)
                        const rd = await rr.json()
                        const coords = rd?.routes?.[0]?.geometry?.coordinates
                        if (!cancelled && Array.isArray(coords) && coords.length > 1)
                            map.geoObjects.add(new ym.Polyline(coords.map((p: number[]) => [p[1], p[0]]), {}, { strokeColor: "#3A3AF4", strokeWidth: 4, strokeOpacity: 0.85 }))
                    } catch {}
                }
                driverPin.current = new ym.Placemark(driverPos || pickup, {}, {
                    iconLayout: pin("Taksi", "rgba(14,138,95,0.95)", "#fff", "#0E8A5F"),
                    zIndex: 1300,
                    visible: !!driverPos,
                } as any)
                map.geoObjects.add(driverPin.current)
                const pts = [pickup, ...(dest ? [dest] : []), ...(driverPos ? [driverPos] : [])]
                if (pts.length > 1) {
                    const lats = pts.map((p) => p[0]), lngs = pts.map((p) => p[1])
                    map.setBounds([[Math.min(...lats) - 0.004, Math.min(...lngs) - 0.004], [Math.max(...lats) + 0.004, Math.max(...lngs) + 0.004]], { checkZoomRange: true, zoomMargin: 24 })
                }
            })
        }
        if ((window as any).ymaps) init()
        else {
            const s = document.createElement("script")
            s.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=tr_TR`
            s.onload = init
            document.head.appendChild(s)
        }
        return () => { cancelled = true }
    }, [ride?.id, showMap])

    useEffect(() => {
        if (!driverPos || !driverPin.current) return
        driverPin.current.geometry.setCoordinates(driverPos)
        driverPin.current.options.set("visible", true)
    }, [driverPos?.[0], driverPos?.[1]])

    let etaText = ""
    if (isActive && driverPos) {
        const target = ride?.pickedUp ? dest : pickup
        if (target) {
            const km = distKm(driverPos, target)
            const min = Math.max(1, Math.round((km / 30) * 60))
            etaText = ride?.pickedUp ? `Varışa ~${min} dk · ${km.toFixed(1)} km` : `Size ~${min} dk · ${km.toFixed(1)} km`
        }
    }

    const title = isPending ? "Sürücü aranıyor" : isActive ? (ride?.pickedUp ? "Yolculuk başladı" : "Taksiniz yolda") : isDone ? "Yolculuk tamamlandı" : isCancelled ? "Yolculuk iptal edildi" : isNoService ? "Şu an hizmet veremiyoruz" : "Yolculuk"
    const icon = isDone ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    ) : isCancelled || isNoService ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16" /><rect x="3.5" y="16" width="17" height="4" rx="1.5" /><path d="M9.5 6h5" /></svg>
    )

    return (
        <div className="pt-page">
            <style>{CSS}</style>
            <div className="pt-card">
                <span className="pt-glow" aria-hidden="true" />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={"pt-ic" + (isDone ? " pt-ic-ok" : isCancelled || isNoService ? " pt-ic-bad" : "")}>{icon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="pt-eyebrow">
                            {(isPending || isActive) && <span className="pt-live" />}
                            PayTaksi · Canlı takip
                        </div>
                        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>{title}</div>
                    </div>
                    {ride && !isNoService && (
                        <span className="pt-pill"><b>{Math.round(Number(ride.estimatedPrice || 250))} TL</b></span>
                    )}
                </div>

                {loading ? (
                    <p style={{ margin: "20px 0 4px", fontSize: 14, color: C.ink2 }}>Yükleniyor...</p>
                ) : err && !ride ? (
                    <p className="pt-note" style={{ marginTop: 16, background: "rgba(179,38,30,0.08)", color: C.danger }}>{err}</p>
                ) : (
                    <>
                        {isPending && (
                            <p className="pt-note" style={{ marginTop: 16, background: "rgba(58,58,244,0.08)", color: C.accent }}>
                                Çağrınız en yakın sıradaki sürücüye iletildi. Sürücü onayladığında burada canlı takip başlayacak. Lütfen sayfayı kapatmayın.
                            </p>
                        )}
                        {isNoService && (
                            <p className="pt-note" style={{ marginTop: 16, background: "rgba(179,38,30,0.08)", color: C.danger }}>
                                Üzgünüz, şu an size hizmet veremiyoruz. Sürücülerimizin hepsi meşgul ya da müsait değil. Bilgi, girdiğiniz telefon numarasına da mesaj olarak gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.
                            </p>
                        )}
                        {isCancelled && (
                            <p className="pt-note" style={{ marginTop: 16, background: "rgba(179,38,30,0.08)", color: C.danger }}>
                                Sürücü size ulaşamadığı için yolculuk iptal edildi. Ücret alınmaz.
                            </p>
                        )}

                        {showMap && pickup && (
                            <div className="pt-tile" style={{ marginTop: 16, height: 240, overflow: "hidden", background: "#E8E5DD" }}>
                                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                            </div>
                        )}

                        {isActive && ride?.driver && (
                            <div className="pt-tile" style={{ marginTop: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                <div>
                                    <div className="pt-label">Sürücünüz</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 1 }}>{ride.driver.fullName}</div>
                                </div>
                                <span className="pt-pill"><b>{ride.driver.plate}</b></span>
                            </div>
                        )}
                        {etaText && (
                            <p className="pt-note" style={{ marginTop: 10, background: "rgba(14,138,95,0.10)", color: C.ok, textAlign: "center" }}>{etaText}</p>
                        )}
                        {isActive && !driverPos && (
                            <p className="pt-note" style={{ marginTop: 10, background: "rgba(16,17,20,0.05)", color: C.ink2, textAlign: "center" }}>Sürücü konumu bekleniyor...</p>
                        )}
                        {isDone && (
                            <p className="pt-note" style={{ marginTop: 14, background: "rgba(14,138,95,0.10)", color: C.ok, textAlign: "center" }}>
                                Yolculuk tamamlandı. PayTaksi'yi tercih ettiğiniz için teşekkürler!
                            </p>
                        )}

                        <div className="pt-tile" style={{ marginTop: 12, padding: "4px 14px" }}>
                            <div className="pt-stop">
                                <span className="pt-dot" />
                                <div style={{ minWidth: 0 }}>
                                    <div className="pt-label">Alınış</div>
                                    <div className="pt-place">{ride?.pickupAddress}</div>
                                </div>
                            </div>
                            <div className="pt-link" />
                            <div className="pt-stop">
                                <span className="pt-dot pt-dot-end" />
                                <div style={{ minWidth: 0 }}>
                                    <div className="pt-label">Varış</div>
                                    <div className="pt-place">{String(ride?.destinationAddress || "").replace(/\s*\(https?:\/\/[^)]+\)/g, "")}</div>
                                </div>
                            </div>
                        </div>

                        {(isDone || isCancelled || isNoService) && (
                            <a href="/" className="pt-btn" style={{ marginTop: 14 }}>Ana sayfaya dön</a>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
