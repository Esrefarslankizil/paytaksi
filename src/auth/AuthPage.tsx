// PayTaksi · Giriş Yap & Hesap Oluştur & Profil CRUD (/giris, /kayit)
// "Taksini çağır" modalındaki pt-card tasarımının birebir aynısı (aynı pt-* sınıfları ve CSS)
import * as React from "react"
import { useEffect, useState } from "react"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    accent: "#3A3AF4",
    ok: "#0E8A5F",
}
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

export const TOKEN_KEY = "paytaksi_jwt_token"

export interface AuthUser {
    id: string
    email: string
    fullName: string
    phoneNumber?: string | null
    roles: string[]
}

export function getApiBase() {
    const envUrl = (import.meta as any).env?.VITE_API_URL
    if (envUrl) return String(envUrl).replace(/\/$/, "")
    const h = window.location.hostname
    if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
        return `http://${h}:5080`
    return "https://api.paytaksi.com.tr"
}

function formatTrPhone(raw: string): string {
    let d = raw.replace(/\D/g, "")
    if (d.startsWith("90") && d.length > 10) d = "0" + d.slice(2)
    else if (d.length > 0 && d[0] !== "0") d = "0" + d
    d = d.slice(0, 11)
    return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean).join(" ")
}

// Ana sitedeki pt-* stilleriyle aynı CSS
const PT_CSS = `
  @keyframes ptFade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes ptIn { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
  @keyframes ptUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: none } }
  @keyframes ptPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.55) } 100% { box-shadow: 0 0 0 7px rgba(34,197,94,0) } }
  .pt-overlay {
    position: fixed; inset: 0; z-index: 9999; width: 100vw; height: 100dvh; box-sizing: border-box; overflow-y: auto;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: radial-gradient(120% 90% at 50% 10%, rgba(241,239,234,0.06), rgba(16,17,20,0.38));
    backdrop-filter: blur(6px) saturate(120%);
    -webkit-backdrop-filter: blur(6px) saturate(120%);
    animation: ptFade .25s ease-out both;
  }
  .pt-card {
    position: relative; isolation: isolate; overflow: hidden;
    width: 100%; max-width: 440px; box-sizing: border-box;
    padding: 22px; border-radius: 30px;
    font-family: ${SANS}; color: ${C.ink};
    background: linear-gradient(155deg, rgba(255,255,255,0.74) 0%, rgba(247,247,250,0.52) 48%, rgba(236,237,243,0.44) 100%);
    backdrop-filter: blur(40px) saturate(190%) brightness(1.04);
    -webkit-backdrop-filter: blur(40px) saturate(190%) brightness(1.04);
    border: 1px solid rgba(255,255,255,0.78);
    box-shadow:
      0 40px 100px -24px rgba(16,17,24,0.45),
      0 12px 30px -12px rgba(16,17,24,0.18),
      0 0 0 0.5px rgba(16,17,20,0.08),
      inset 0 1px 0 rgba(255,255,255,0.95),
      inset 0 -1px 0 rgba(255,255,255,0.35);
    animation: ptIn .45s cubic-bezier(.2,.8,.2,1) both;
  }
  .pt-card::after {
    content: ""; position: absolute; inset: 0 0 52% 0; z-index: -1; pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
  }
  .pt-glow {
    position: absolute; z-index: -1; pointer-events: none;
    width: 300px; height: 300px; top: -150px; right: -110px; border-radius: 50%;
    background: radial-gradient(circle, rgba(58,58,244,0.22), rgba(58,58,244,0) 65%);
  }
  .pt-close {
    position: absolute; top: 16px; right: 16px; z-index: 2;
    width: 32px; height: 32px; border-radius: 999px; padding: 0;
    display: grid; place-items: center; cursor: pointer;
    background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.85);
    box-shadow: inset 0 1px 0 #fff, 0 2px 8px rgba(16,17,20,0.08);
    transition: transform .3s cubic-bezier(.2,.8,.2,1), background .2s;
  }
  .pt-close:hover { background: rgba(255,255,255,0.88); transform: rotate(90deg) }
  .pt-ic {
    width: 46px; height: 46px; flex: none; border-radius: 15px;
    display: grid; place-items: center; color: ${C.accent};
    background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(58,58,244,0.10));
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: inset 0 1px 0 #fff, 0 6px 16px -6px rgba(58,58,244,0.35);
  }
  .pt-ic-ok { width: 56px; height: 56px; border-radius: 999px; color: #16a34a;
    background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(34,197,94,0.16));
    box-shadow: inset 0 1px 0 #fff, 0 10px 24px -8px rgba(34,197,94,0.45); }
  .pt-eyebrow { display: flex; align-items: center; gap: 7px; font-family: ${MONO}; font-size: 11px; color: ${C.ink2}; letter-spacing: 0.01em; }
  .pt-live { width: 7px; height: 7px; border-radius: 99px; background: #22c55e; flex: none; animation: ptPulse 1.6s ease-out infinite; }
  .pt-tile {
    display: block; border-radius: 18px;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.88);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.04), 0 8px 20px -14px rgba(16,17,20,0.18);
  }
  .pt-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6D75; }
  .pt-stop { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .pt-place { font-size: 14.5px; font-weight: 600; letter-spacing: -0.015em; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pt-pill {
    display: inline-flex; align-items: center; gap: 6px; flex: none;
    padding: 7px 8px 7px 12px; border-radius: 999px; font-size: 12.5px; color: ${C.ink};
    background: rgba(58,58,244,0.08); border: 1px solid rgba(58,58,244,0.16);
  }
  .pt-pill b { font-family: ${MONO}; font-weight: 600; color: ${C.accent}; }
  .pt-pill-tag { font-family: ${MONO}; font-size: 11px; font-weight: 700; color: #fff; background: ${C.accent}; padding: 3px 7px; border-radius: 999px; }
  .pt-field { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: text; transition: background .2s, box-shadow .2s, border-color .2s; }
  .pt-field:focus-within { background: rgba(255,255,255,0.82); border-color: rgba(58,58,244,0.35);
    box-shadow: 0 0 0 3px rgba(58,58,244,0.14), inset 0 1px 0 #fff; }
  .pt-input { width: 100%; box-sizing: border-box; border: 0; outline: none; background: transparent; padding: 0; margin-top: 1px;
    font-family: ${SANS}; font-size: 16px; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
  .pt-input::placeholder { color: #A3A5AD; }
  .pt-primary {
    position: relative; overflow: hidden; width: 100%; border: 0; cursor: pointer; text-align: left;
    display: flex; align-items: center; gap: 12px; padding: 14px 14px 14px 18px; border-radius: 18px;
    font-family: ${SANS}; color: #fff;
    background: linear-gradient(180deg, #5050FF 0%, ${C.accent} 55%, #2E2EDC 100%);
    box-shadow: 0 14px 30px -10px rgba(58,58,244,0.6), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15);
    transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s;
  }
  .pt-primary::after {
    content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    transform: skewX(-20deg); transition: left .7s ease;
  }
  .pt-primary:hover { transform: translateY(-1px); box-shadow: 0 18px 38px -10px rgba(58,58,244,0.7), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15); }
  .pt-primary:hover::after { left: 130%; }
  .pt-primary:active { transform: scale(.985); }
  .pt-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .pt-badge { flex: none; font-family: ${MONO}; font-size: 13px; font-weight: 600; padding: 8px 10px; border-radius: 12px;
    background: rgba(255,255,255,0.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3); }
  .pt-ghost {
    width: 100%; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 13px 16px; border-radius: 16px; font-family: ${SANS}; font-size: 14px; font-weight: 600; color: ${C.ink};
    background: rgba(255,255,255,0.42); border: 1px solid rgba(255,255,255,0.85);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.05);
    transition: background .2s, transform .2s;
  }
  .pt-ghost:hover { background: rgba(255,255,255,0.72); }
  .pt-ghost:active { transform: scale(.985); }
  .pt-divider { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #8E9099; }
  .pt-divider::before, .pt-divider::after { content: ""; flex: 1; height: 1px; background: rgba(16,17,20,0.08); }
  .pt-close:focus-visible, .pt-primary:focus-visible, .pt-ghost:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 3px; }
  .pt-linkbtn { border: 0; background: none; padding: 0; cursor: pointer; font-family: ${SANS}; font-size: 12.5px; font-weight: 600; color: ${C.accent}; }
  @media (max-width: 700px) {
    .pt-overlay { padding: 10px; }
    .pt-card { padding: 20px 18px 18px; border-radius: 28px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pt-overlay, .pt-card, .pt-live { animation: none; }
  }
`

const CarIcon = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 16.5V12l1.8-4.6A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.4L19 12v4.5" />
        <path d="M4 12h16v4.5H4zM9.5 6V4.5h5V6" />
        <circle cx="7.5" cy="16.5" r="1.6" />
        <circle cx="16.5" cy="16.5" r="1.6" />
    </svg>
)

export default function AuthPage({
    initialMode = "login",
    requireRole,
    onAuthenticated,
}: {
    initialMode?: "login" | "register"
    requireRole?: "Admin" | "Taksici" | "Yolcu"
    onAuthenticated?: (user: AuthUser) => void
}) {
    const [mode, setMode] = useState<"login" | "register">(initialMode)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [role, setRole] = useState<"Yolcu" | "Taksici">("Yolcu")
    const [busy, setBusy] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [okMsg, setOkMsg] = useState<string | null>(null)
    const [me, setMe] = useState<AuthUser | null>(null)
    const [welcomeOpen, setWelcomeOpen] = useState(false)
    const [termsAgreed, setTermsAgreed] = useState(false)
    const [docModal, setDocModal] = useState<"terms" | "kvkk" | null>(null)

    const loadMe = async () => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) return
        try {
            const res = await fetch(`${getApiBase()}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                localStorage.removeItem(TOKEN_KEY)
                return
            }
            const u: AuthUser = await res.json()
            setMe(u)
            setFullName(u.fullName)
            setPhone(u.phoneNumber || "")
            if (onAuthenticated && (!requireRole || u.roles.includes(requireRole))) {
                onAuthenticated(u)
            }
        } catch {}
    }

    useEffect(() => {
        loadMe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr(null)
        setOkMsg(null)
        if (mode === "register" && !requireRole && !termsAgreed) {
            setErr("Hesap oluşturmak için lütfen Kullanım Koşulları ve KVKK Aydınlatma Metni kutucuğunu onaylayın.")
            return
        }
        setBusy(true)
        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
            const payload =
                mode === "login"
                    ? { email, password }
                    : { email, password, fullName, phoneNumber: phone, role }

            const res = await fetch(`${getApiBase()}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setErr(data.error || "İşlem başarısız. Bilgilerinizi kontrol edin.")
                return
            }
            localStorage.setItem(TOKEN_KEY, data.token)
            const u: AuthUser = data.user
            setMe(u)
            setFullName(u.fullName)
            setPhone(u.phoneNumber || "")

            if (requireRole && !u.roles.includes(requireRole)) {
                setErr(`Bu alan için '${requireRole}' yetkisi gerekiyor.`)
                return
            }
            if (onAuthenticated) {
                onAuthenticated(u)
                return
            }
            setOkMsg(mode === "login" ? "Giriş başarılı!" : "Hesabınız oluşturuldu!")
        } catch {
            setErr("Sunucuya bağlanılamadı (.NET API çalışıyor mu?).")
        } finally {
            setBusy(false)
        }
    }

    const handleGoogleAuth = async () => {
        setErr(null)
        setOkMsg(null)
        if (mode === "register" && !requireRole && !termsAgreed) {
            setErr("Google ile kayıt olmak için lütfen önce Kullanım Koşulları ve KVKK Aydınlatma Metni kutucuğunu onaylayın.")
            return
        }
        setBusy(true)
        try {
            let clientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "").trim()
            if (!clientId) {
                const cfgRes = await fetch(`${getApiBase()}/api/auth/google-config`).catch(() => null)
                if (cfgRes && cfgRes.ok) {
                    const cfg = await cfgRes.json().catch(() => ({}))
                    clientId = (cfg.clientId || "").trim()
                }
            }
            if (!clientId) {
                clientId = "962400518298-5gbgqlvgm803eun9dg2l14bbvhq1irhf.apps.googleusercontent.com"
            }

            const g = (window as any).google
            if (!g?.accounts?.oauth2) {
                setErr("Google giriş servisi yüklenemedi. Sayfayı yenileyip tekrar deneyin.")
                setBusy(false)
                return
            }

            const tokenClient = g.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "openid email profile",
                callback: async (resp: any) => {
                    if (resp?.error || !resp?.access_token) {
                        setErr("Google ile giriş iptal edildi veya başarısız oldu.")
                        setBusy(false)
                        return
                    }
                    try {
                        const res = await fetch(`${getApiBase()}/api/auth/google`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                accessToken: resp.access_token,
                                role: mode === "register" ? role : "Yolcu",
                            }),
                        })
                        const data = await res.json().catch(() => ({}))
                        if (!res.ok) {
                            setErr(data.error || "Google ile giriş başarısız.")
                            return
                        }
                        localStorage.setItem(TOKEN_KEY, data.token)
                        const u: AuthUser = data.user
                        setMe(u)
                        setFullName(u.fullName || "")
                        setPhone(u.phoneNumber || "")
                        if (requireRole && !u.roles.includes(requireRole)) {
                            setErr(`Bu alan için '${requireRole}' yetkisi gerekiyor.`)
                            return
                        }
                        if (onAuthenticated) {
                            onAuthenticated(u)
                            return
                        }
                        setOkMsg("Google ile giriş başarılı!")
                    } catch {
                        setErr("Sunucuya bağlanılamadı (.NET API çalışıyor mu?).")
                    } finally {
                        setBusy(false)
                    }
                },
                error_callback: () => {
                    setBusy(false)
                },
            })
            tokenClient.requestAccessToken({ prompt: "select_account" })
        } catch {
            setErr("Google ile giriş başlatılamadı.")
            setBusy(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token) return
        const digits = phone.replace(/\D/g, "")
        if (digits.length < 10) {
            setErr("Lütfen geçerli bir telefon numarası girin (05XX XXX XX XX).")
            return
        }
        if (needsPhone && !termsAgreed) {
            setErr("Devam etmek için lütfen Kullanım Koşulları ve KVKK Aydınlatma Metni kutucuğunu onaylayın.")
            return
        }
        const wasNeedingPhone = needsPhone
        setBusy(true)
        setErr(null)
        setOkMsg(null)
        try {
            const res = await fetch(`${getApiBase()}/api/auth/me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ fullName: fullName.trim() || me?.fullName || "", phoneNumber: phone }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setErr(data.error || "Güncelleme başarısız.")
                return
            }
            setMe(data.user)
            if (wasNeedingPhone) {
                setWelcomeOpen(true)
            } else {
                setOkMsg("Telefon numaranız ve profil bilgileriniz kaydedildi!")
            }
        } finally {
            setBusy(false)
        }
    }

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (!token || !window.confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) return
        setBusy(true)
        try {
            const res = await fetch(`${getApiBase()}/api/auth/me`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                localStorage.removeItem(TOKEN_KEY)
                setMe(null)
                setEmail("")
                setPassword("")
                setOkMsg("Hesabınız silindi.")
            }
        } finally {
            setBusy(false)
        }
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        setMe(null)
        setOkMsg(null)
        setErr(null)
    }

    const needsPhone = !!me && !requireRole && (me.phoneNumber || "").replace(/\D/g, "").length < 10

    const closePage = () => {
        if (needsPhone) {
            setErr("Devam etmeden önce telefon numaranızı girip kaydetmelisiniz.")
            return
        }
        window.location.href = "/"
    }

    const closeBtn = (
        <button type="button" className="pt-close" aria-label="Kapat" onClick={closePage}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
            </svg>
        </button>
    )

    const msgs = (
        <>
            {err && (
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#B3261E", background: "rgba(179,38,30,0.09)", padding: "9px 12px", borderRadius: 14 }}>
                    {err}
                </div>
            )}
            {okMsg && (
                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ok, background: "rgba(14,138,95,0.10)", padding: "9px 12px", borderRadius: 14 }}>
                    {okMsg}
                </div>
            )}
        </>
    )

    return (
        <div className="pt-overlay">
            <style>{PT_CSS}</style>

            <div className="pt-card">
                <span className="pt-glow" aria-hidden="true" />
                {closeBtn}

                {welcomeOpen && me ? (
                    <div style={{ textAlign: "center", padding: "18px 6px 6px" }}>
                        <span className="pt-ic pt-ic-ok" style={{ margin: "0 auto 14px" }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                        </span>
                        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: C.ink }}>
                            Hoş geldiniz!
                        </div>
                        <p style={{ margin: "8px auto 0", maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: C.ink2 }}>
                            PayTaksi ile ucuz, güvenilir ve hızlı yolculuk yapmanın şimdi tam sırası! Üstelik ilk yolculuğunuza özel <b>%15 indirimli</b>.
                        </p>
                        <button
                            type="button"
                            className="pt-primary"
                            onClick={() => {
                                window.location.href = "/"
                            }}
                            style={{ marginTop: 20, justifyContent: "center", textAlign: "center" }}
                        >
                            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                Tamam
                            </span>
                        </button>
                    </div>
                ) : me && !requireRole ? (
                    <>
                        {/* Profil görünümü */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 40 }}>
                            <span className="pt-ic">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            </span>
                            <div style={{ minWidth: 0 }}>
                                <div className="pt-eyebrow">
                                    <span className="pt-live" />
                                    {me.roles.join(", ")} · {me.email}
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>{me.fullName}</div>
                            </div>
                        </div>

                        {needsPhone && (
                            <div
                                style={{
                                    marginTop: 14,
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    color: C.accent,
                                    background: "rgba(58,58,244,0.08)",
                                    border: "1px solid rgba(58,58,244,0.22)",
                                    padding: "10px 12px",
                                    borderRadius: 14,
                                }}
                            >
                                Taksi çağırabilmek için telefon numaranızı girmeniz zorunludur.
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: needsPhone ? 12 : 18 }}>
                            <label className="pt-tile pt-field">
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span className="pt-label" style={{ display: "block" }}>Ad (veya Ad Soyad)</span>
                                    <input className="pt-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="İsminiz" />
                                </span>
                            </label>
                            <label
                                className="pt-tile pt-field"
                                style={needsPhone ? { borderColor: "rgba(58,58,244,0.45)", boxShadow: "0 0 0 3px rgba(58,58,244,0.12), inset 0 1px 0 #fff" } : undefined}
                            >
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span className="pt-label" style={{ display: "block" }}>
                                        Telefon numarası <span style={{ color: "#B3261E" }}>*</span>
                                    </span>
                                    <input
                                        className="pt-input"
                                        type="tel"
                                        inputMode="tel"
                                        required
                                        autoFocus={needsPhone}
                                        value={phone}
                                        onChange={(e) => setPhone(formatTrPhone(e.target.value))}
                                        placeholder="05XX XXX XX XX"
                                    />
                                </span>
                            </label>
                            {needsPhone && (
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 9,
                                        padding: "10px 12px",
                                        borderRadius: 14,
                                        background: "rgba(255,255,255,0.68)",
                                        border: "1px solid rgba(16,17,20,0.09)",
                                        fontSize: 12,
                                        lineHeight: 1.45,
                                        color: C.ink2,
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={termsAgreed}
                                        onChange={(e) => {
                                            setTermsAgreed(e.target.checked)
                                            if (e.target.checked) setErr(null)
                                        }}
                                        style={{ marginTop: 2, accentColor: C.accent, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                                    />
                                    <span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setDocModal("terms")
                                            }}
                                            style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: SANS, fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: "underline" }}
                                        >
                                            Kullanım Koşulları ve Kullanıcı Sözleşmesi
                                        </button>{" "}
                                        ile{" "}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setDocModal("kvkk")
                                            }}
                                            style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: SANS, fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: "underline" }}
                                        >
                                            KVKK Aydınlatma Metni
                                        </button>
                                        'ni okudum, kabul ediyorum.
                                    </span>
                                </label>
                            )}
                            {msgs}
                            <button type="submit" disabled={busy} className="pt-primary" style={{ marginTop: 6 }}>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                        {needsPhone ? "Numarayı kaydet ve devam et" : "Profili güncelle"}
                                    </span>
                                    <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                        {needsPhone ? "Sürücünün size ulaşabilmesi için gereklidir" : "Bilgilerin anında kaydedilir"}
                                    </span>
                                </span>
                            </button>
                        </form>

                        {!needsPhone && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                                {me.roles.includes("Admin") && (
                                    <a href="/admin" className="pt-ghost" style={{ textDecoration: "none" }}>
                                        <span>Admin Paneli</span>
                                        <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>/admin</span>
                                    </a>
                                )}
                                {me.roles.includes("Taksici") && (
                                    <a href="/surucu" className="pt-ghost" style={{ textDecoration: "none" }}>
                                        <span>Sürücü Paneli</span>
                                        <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>/surucu</span>
                                    </a>
                                )}
                                <a href="/" className="pt-ghost" style={{ textDecoration: "none" }}>
                                    <span>Ana sayfaya dön</span>
                                    <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>Taksi çağır</span>
                                </a>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                            <button type="button" onClick={logout} className="pt-linkbtn" style={{ color: C.ink2 }}>
                                Çıkış yap
                            </button>
                            <button type="button" onClick={handleDeleteAccount} className="pt-linkbtn" style={{ color: "#B3261E" }}>
                                Hesabı sil
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Başlık (Taksini çağır modalıyla aynı yapı) */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 40 }}>
                            <span className="pt-ic">
                                <CarIcon />
                            </span>
                            <div style={{ minWidth: 0 }}>
                                <div className="pt-eyebrow">
                                    <span className="pt-live" />
                                    {requireRole === "Admin" ? "PayTaksi · Yönetim paneli" : "Elazığ · üyelere %15 indirim"}
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                    {requireRole === "Admin" ? "Admin girişi" : mode === "login" ? "Hesabına giriş yap" : "Hesap oluştur"}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Kayıt: Ad Soyad + Telefon (pt-tile içinde, iki satır) */}
                            {mode === "register" && !requireRole && (
                                <div className="pt-tile" style={{ marginTop: 18, padding: "4px 14px" }}>
                                    <label className="pt-stop" style={{ cursor: "text" }}>
                                        <span className="pt-dot" style={{ width: 10, height: 10, flex: "none", borderRadius: 99, background: C.accent, boxShadow: "0 0 0 4px rgba(58,58,244,0.14)" }} />
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div className="pt-label">Ad Soyad</div>
                                            <input className="pt-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ahmet Yılmaz" style={{ fontSize: 15, fontWeight: 600 }} />
                                        </div>
                                    </label>
                                    <div aria-hidden="true" style={{ margin: "-6px 0 -6px 4.5px", height: 14, borderLeft: "1.5px dashed rgba(16,17,20,0.2)" }} />
                                    <label className="pt-stop" style={{ cursor: "text" }}>
                                        <span style={{ width: 10, height: 10, flex: "none", borderRadius: 3, background: C.ink, boxShadow: "0 0 0 4px rgba(16,17,20,0.08)" }} />
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div className="pt-label">Telefon numarası</div>
                                            <input
                                                className="pt-input"
                                                type="tel"
                                                inputMode="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(formatTrPhone(e.target.value))}
                                                placeholder="05XX XXX XX XX"
                                                style={{ fontSize: 15, fontWeight: 600 }}
                                            />
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Hesap türü (Yolcu / Taksici) — fiyat kutusu yapısında */}
                            {mode === "register" && !requireRole && (
                                <div className="pt-tile" style={{ marginTop: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                    <div>
                                        <div className="pt-label">Hesap türü</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>{role}</div>
                                    </div>
                                    <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, background: "rgba(58,58,244,0.08)", border: "1px solid rgba(58,58,244,0.16)" }}>
                                        {(["Yolcu", "Taksici"] as const).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRole(r)}
                                                style={{
                                                    border: 0,
                                                    cursor: "pointer",
                                                    padding: "6px 12px",
                                                    borderRadius: 999,
                                                    fontFamily: SANS,
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    background: role === r ? C.accent : "transparent",
                                                    color: role === r ? "#fff" : C.ink2,
                                                }}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* E-posta */}
                            <label className="pt-tile pt-field" style={{ marginTop: mode === "register" && !requireRole ? 10 : 18 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                                    <path d="M4 7l8 6 8-6" />
                                </svg>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span className="pt-label" style={{ display: "block" }}>E-posta</span>
                                    <input
                                        className="pt-input"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="ornek@gmail.com"
                                    />
                                </span>
                            </label>

                            {/* Şifre */}
                            <label className="pt-tile pt-field" style={{ marginTop: 10 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                                    <rect x="4" y="11" width="16" height="10" rx="2.5" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span className="pt-label" style={{ display: "block" }}>Şifre</span>
                                    <input
                                        className="pt-input"
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="En az 6 karakter"
                                    />
                                </span>
                                <button
                                    type="button"
                                    aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                                    onClick={() => setShowPw((s) => !s)}
                                    style={{
                                        flex: "none",
                                        width: 30,
                                        height: 30,
                                        border: 0,
                                        background: "transparent",
                                        display: "grid",
                                        placeItems: "center",
                                        color: C.ink2,
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                >
                                    {showPw ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M3 3l18 18" />
                                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                            <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c5 0 9.2 3.1 10.8 7a11.7 11.7 0 0 1-3.1 4.3" />
                                            <path d="M6.6 6.6A11.7 11.7 0 0 0 1.2 12C2.8 15.9 7 19 12 19a10.6 10.6 0 0 0 4.6-1" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M1.2 12C2.8 8.1 7 5 12 5s9.2 3.1 10.8 7C21.2 15.9 17 19 12 19S2.8 15.9 1.2 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </label>

                            {mode === "login" && !requireRole && (
                                <div style={{ marginTop: 8, paddingLeft: 4, textAlign: "left" }}>
                                    <button type="button" className="pt-linkbtn" onClick={() => setOkMsg("Şifre sıfırlama yakında aktif olacak.")}>
                                        Şifremi unuttum
                                    </button>
                                </div>
                            )}

                            {mode === "register" && !requireRole && (
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 9,
                                        marginTop: 12,
                                        padding: "10px 12px",
                                        borderRadius: 14,
                                        background: "rgba(255,255,255,0.68)",
                                        border: "1px solid rgba(16,17,20,0.09)",
                                        fontSize: 12,
                                        lineHeight: 1.45,
                                        color: C.ink2,
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={termsAgreed}
                                        onChange={(e) => {
                                            setTermsAgreed(e.target.checked)
                                            if (e.target.checked) setErr(null)
                                        }}
                                        style={{ marginTop: 2, accentColor: C.accent, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                                    />
                                    <span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setDocModal("terms")
                                            }}
                                            style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: SANS, fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: "underline" }}
                                        >
                                            Kullanım Koşulları ve Kullanıcı Sözleşmesi
                                        </button>{" "}
                                        ile{" "}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setDocModal("kvkk")
                                            }}
                                            style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: SANS, fontSize: 12, color: C.accent, fontWeight: 700, textDecoration: "underline" }}
                                        >
                                            KVKK Aydınlatma Metni
                                        </button>
                                        'ni okudum, kabul ediyorum.
                                    </span>
                                </label>
                            )}

                            {(err || okMsg) && <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>{msgs}</div>}

                            {/* Aksiyonlar */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                                <button type="submit" disabled={busy} className="pt-primary">
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                            {busy ? "Bekleyin..." : mode === "login" ? "Giriş yap" : "Hesap oluştur"}
                                        </span>
                                        <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                            {requireRole === "Admin"
                                                ? "Yönetici yetkisi doğrulanır"
                                                : mode === "login"
                                                    ? "Üyelere %15 indirimle taksi çağır"
                                                    : "Saniyeler içinde üye ol, %15 indirim kazan"}
                                        </span>
                                    </span>
                                    <span className="pt-badge">-%15</span>
                                </button>

                                {!requireRole && (
                                    <>
                                        <div className="pt-divider">veya</div>
                                        <button type="button" disabled={busy} className="pt-ghost" onClick={handleGoogleAuth}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                                                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                                                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
                                                    <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                                                    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                                                </svg>
                                                {mode === "login" ? "Google ile giriş yap" : "Google ile kayıt ol"}
                                            </span>
                                            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>tek dokunuş</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>

                        {!requireRole && (
                            <div style={{ marginTop: 14, textAlign: "center", fontSize: 12.5, color: C.ink2 }}>
                                {mode === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
                                <button
                                    type="button"
                                    className="pt-linkbtn"
                                    onClick={() => {
                                        setMode(mode === "login" ? "register" : "login")
                                        setErr(null)
                                        setOkMsg(null)
                                    }}
                                >
                                    {mode === "login" ? "Buradan kayıt ol" : "Giriş yap"}
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: 12, textAlign: "center", fontSize: 11.5, color: "#8E9099" }}>
                            Sürpriz ücret yok · Sabit tarife · Ücretsiz iptal
                        </div>
                    </>
                )}
            </div>

            {/* Sözleşme & KVKK Beyaz Kağıt Okuma Modalı */}
            {docModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={docModal === "terms" ? "Kullanım Koşulları ve Kullanıcı Sözleşmesi" : "KVKK Aydınlatma Metni"}
                    onClick={() => setDocModal(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 10050,
                        background: "rgba(16, 17, 20, 0.48)",
                        backdropFilter: "blur(5px)",
                        WebkitBackdropFilter: "blur(5px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        boxSizing: "border-box",
                        animation: "ptFade .2s ease-out both",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: 640,
                            maxHeight: "84dvh",
                            background: "#FFFFFF",
                            color: C.ink,
                            fontFamily: SANS,
                            borderRadius: 24,
                            boxShadow: "0 36px 90px -20px rgba(16, 17, 24, 0.45), 0 0 0 1px rgba(16, 17, 20, 0.08)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            animation: "ptIn .28s cubic-bezier(.2,.8,.2,1) both",
                        }}
                    >
                        {/* Üst Başlık & Çarpı (Kapat) Butonu */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: "18px 22px 14px",
                                borderBottom: "1px solid rgba(16, 17, 20, 0.08)",
                                background: "#FFFFFF",
                                flexShrink: 0,
                            }}
                        >
                            <div>
                                <div style={{ fontFamily: MONO, fontSize: 11, color: C.accent, fontWeight: 600 }}>
                                    PAYTAKSİ · YASAL METİN
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.025em", color: C.ink, marginTop: 2 }}>
                                    {docModal === "terms"
                                        ? "Kullanım Koşulları ve Kullanıcı Sözleşmesi"
                                        : "6698 Sayılı KVKK Aydınlatma Metni"}
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Kapat"
                                onClick={() => setDocModal(null)}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 999,
                                    border: "1px solid rgba(16, 17, 20, 0.12)",
                                    background: "#F6F6F8",
                                    display: "grid",
                                    placeItems: "center",
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    padding: 0,
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Beyaz Kağıt İçerik Alanı (Kaydırılabilir) */}
                        <div
                            style={{
                                padding: "20px 24px",
                                overflowY: "auto",
                                fontSize: 14,
                                lineHeight: 1.68,
                                color: "#383A42",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            {docModal === "terms" ? (
                                <>
                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>1. Taraflar, Konu ve Yasal Dayanak</div>
                                    <p style={{ margin: 0 }}>
                                        İşbu Kullanım Koşulları ve Kullanıcı Sözleşmesi (“Sözleşme”), <b>www.paytaksi.com.tr</b> üzerinden faaliyet gösteren <b>PayTaksi Dijital Ulaşım Platformu</b> (“PayTaksi”) ile Platform’a üye olan veya hizmetlerden yararlanan gerçek kişi (“Kullanıcı” / “Yolcu”) arasında; <b>6098 sayılı Türk Borçlar Kanunu</b>, <b>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</b>, <b>6502 sayılı Tüketicinin Korunması Hakkında Kanun</b>, <b>5651 sayılı Kanun</b> ve <b>6698 sayılı KVKK</b> hükümlerine uygun olarak elektronik ortamda yürürlüğe girmiştir.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>2. PayTaksi’nin Hukuki Statüsü (Aracı Hizmet Sağlayıcı)</div>
                                    <p style={{ margin: 0 }}>
                                        PayTaksi, <b>6563 sayılı Kanun</b> kapsamında “Aracı Hizmet Sağlayıcı” statüsündedir. PayTaksi doğrudan taşımacılık yapmamakta; taksi ihtiyacı bulunan Yolcu ile Elazığ il sınırları içinde resmi ticari plakalı (`23 T`) bağımsız Taksi Sürücüsünü dijital ortamda eşleştiren teknolojik altyapıyı sunmaktadır.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>3. Üyelik ve Çağrı Kuralları</div>
                                    <p style={{ margin: 0 }}>
                                        Sürücünün yolcuya ulaşabilmesi için geçerli bir cep telefonu numarasının (`05XX XXX XX XX`) girilmesi zorunludur. Üye girişi yapmadan nakit ödeme seçeneğiyle oluşturulan çağrılarda sahte çağrıları önlemek adına 60 dakikalık bekleme süresi uygulanır; üye girişi yapan ve cüzdan bakiyesi kullanan kullanıcılar %15 indirimle kesintisiz çağrı oluşturabilir.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>4. Ücretlendirme ve 6493 Sayılı Kanun Kapsamında Ödeme</div>
                                    <p style={{ margin: 0 }}>
                                        Yolculuk ücretleri güncel Elazığ taksi tarifesi (İndi-Bindi `250 TL`, Açılış `50 TL`, Km başı `45 TL/km`) esas alınarak karayolu mesafesine göre otomatik hesaplanır. Kartlı bakiye yükleme işlemleri <b>6493 sayılı Kanun</b> uyarınca TCMB ve BDDK lisanslı ödeme kuruluşu <b>PayTR</b> 3D Secure altyapısı üzerinden gerçekleştirilir; PayTaksi kart bilgilerini kesinlikle saklamaz.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>5. Uyuşmazlıkların Çözümü</div>
                                    <p style={{ margin: 0 }}>
                                        İşbu Sözleşme’den doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti Hukuku uygulanır ve <b>Elazığ Mahkemeleri ile Tüketici Hakem Heyetleri</b> yetkilidir.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>1. Veri Sorumlusunun Kimliği</div>
                                    <p style={{ margin: 0 }}>
                                        <b>6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi</b> ve ilgili Tebliğ uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla <b>PayTaksi Dijital Ulaşım Platformu – Eşref KIZILARSLAN</b> (www.paytaksi.com.tr · Merkez / Elazığ · Tel: 0501 136 68 15) tarafından aşağıda açıklanan kapsamda işlenmektedir.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>2. İşlenen Kişisel Veriler ve Hukuki Sebepler (KVKK m. 5)</div>
                                    <p style={{ margin: 0 }}>
                                        <b>Kimlik (Ad, Soyad)</b>, <b>İletişim (Telefon Numarası, E-posta)</b>, <b>Lokasyon (Alış/Varış Konumu, GPS)</b>, <b>Yolculuk/İşlem Kayıtları</b> ve <b>İşlem Güvenliği (IP, Log)</b> verileriniz; KVKK Madde 5/2-a (Kanunlarda açıkça öngörülmesi – 5651 ve 6563 sayılı Kanunlar), Madde 5/2-c (Taksi çağırma ve üyelik sözleşmesinin kurulması ve ifası), Madde 5/2-ç (Hukuki yükümlülük) ve Madde 5/2-f (Veri sorumlusunun meşru menfaati) hukuki sebeplerine dayanılarak elektronik ortamda işlenmektedir.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>3. Kişisel Verilerin Aktarılması (KVKK m. 8)</div>
                                    <p style={{ margin: 0 }}>
                                        Adınız, telefon numaranız ve alış/varış adresiniz yalnızca çağrınızı kabul eden resmi ticari taksi sürücüsüne; bakiye yükleme işlem bilgileriniz ise 6493 sayılı Kanun kapsamında BDDK lisanslı ödeme kuruluşu <b>PayTR</b>’ye ve yasal zorunluluk halinde yetkili kamu kurumlarına aktarılır.
                                    </p>

                                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginTop: 4 }}>4. KVKK Madde 11 Kapsamındaki Haklarınız</div>
                                    <p style={{ margin: 0 }}>
                                        KVKK’nın 11. maddesi kapsamındaki bilgi talep etme, düzeltme ve silme haklarınızı <b>destek@paytaksi.com.tr</b> adresine e-posta göndererek veya profil ekranındaki <b>“Hesabı sil”</b> butonuyla her zaman kullanabilirsiniz.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Alt Bar */}
                        <div
                            style={{
                                padding: "12px 22px 16px",
                                borderTop: "1px solid rgba(16, 17, 20, 0.08)",
                                background: "#FAFAFC",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                flexShrink: 0,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setTermsAgreed(true)
                                    setErr(null)
                                    setDocModal(null)
                                }}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: 12,
                                    border: 0,
                                    background: C.accent,
                                    color: "#fff",
                                    fontFamily: SANS,
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Okudum, Onayla ve Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
