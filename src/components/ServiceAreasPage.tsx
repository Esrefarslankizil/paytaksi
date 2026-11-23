import * as React from "react"
import { useEffect, useState } from "react"
import Footer from "./Footer"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16, 17, 20, 0.09)",
    accent: "#3A3AF4",
    ok: "#0E8A5F",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

const ACTIVE_ZONES = [
    {
        title: "Elazığ Merkez & Çarşı",
        eta: "~2 dk",
        areas: ["Gazi Caddesi", "İzzetpaşa", "Nailbey", "Cumhuriyet Mah.", "Yeni Mahalle", "Kültür Park"],
        desc: "Şehir merkezinin tamamında 7/24 kesintisiz ve en hızlı taksi yönlendirme.",
    },
    {
        title: "Elysium Park AVM & Çaydaçıra",
        eta: "~3 dk",
        areas: ["Çaydaçıra Mah.", "Ataşehir", "Abdullahpaşa", "Hilalkent", "Malatya Yolu", "Üniversite Mah."],
        desc: "Modern konut bölgeleri ve alışveriş merkezlerinden sabit fiyatlı anlık taksi.",
    },
    {
        title: "Fethi Sekin Şehir Hastanesi & Kampüs",
        eta: "~3 dk",
        areas: ["Şehir Hastanesi", "Fırat Üniversitesi", "Fırat Tıp Merkezi", "Doğukent", "Ulukent", "Sanayi"],
        desc: "Hastane acil/poliklinik çıkışları ve üniversite kampüsüne 7/24 öncelikli araç.",
    },
    {
        title: "Elazığ Havalimanı Transfer",
        eta: "~5 dk",
        areas: ["Elazığ Havalimanı (EZS)", "Akçakiraz", "Yazıkonak", "Yurtbaşı", "Kuyulu"],
        desc: "Uçuş saatlerinize uygun, sürpriz ücret olmadan kapıdan terminale sabit fiyatlı transfer.",
    },
    {
        title: "Harput & Turistik Noktalar",
        eta: "~6 dk",
        areas: ["Harput Kalesi", "Buzluk Mağarası", "Hilton & Oteller", "Sivrice / Hazar Gölü", "Keban Yolu"],
        desc: "Tarihi Harput, oteller bölgesi ve Hazar Gölü güzergâhlarında güvenilir ulaşım.",
    },
    {
        title: "Elazığ İlçeleri & Çevre",
        eta: "Planlı / Anlık",
        areas: ["Kovancılar", "Karakoçan", "Palu", "Baskil", "Maden", "Sivrice", "Keban", "Arıcak", "Alacakaya", "Ağın"],
        desc: "Elazığ'ın tüm ilçelerine ve çevre mahallelerine şeffaf kilometre tarifesiyle ulaşım.",
    },
]

const UPCOMING_CITIES = [
    { name: "Malatya", tag: "Yakında" },
    { name: "Diyarbakır", tag: "Yakında" },
    { name: "Tunceli", tag: "Yakında" },
    { name: "Bingöl", tag: "Yakında" },
    { name: "Şanlıurfa", tag: "Planlanıyor" },
    { name: "Gaziantep", tag: "Planlanıyor" },
]

export default function ServiceAreasPage() {
    const [authUser, setAuthUser] = useState<{ fullName?: string; email?: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const getApiUrl = () => {
        const envUrl = (import.meta as any).env?.VITE_API_URL
        if (envUrl) return String(envUrl).replace(/\/$/, "")
        const h = window.location.hostname
        if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
            return `http://${h}:5080`
        return "https://api.paytaksi.com.tr"
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        if (!document.getElementById("staysift-fonts")) {
            const l = document.createElement("link")
            l.id = "staysift-fonts"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            document.head.appendChild(l)
        }
        const token = localStorage.getItem("paytaksi_jwt_token")
        if (!token) return
        if (token.startsWith("google_oauth_")) {
            try {
                const raw = localStorage.getItem("paytaksi_google_user")
                if (raw) setAuthUser(JSON.parse(raw))
            } catch {}
            return
        }
        fetch(`${getApiUrl()}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((u) => {
                if (u) setAuthUser(u)
            })
            .catch(() => {})
    }, [])

    const userInitial = authUser
        ? (authUser.fullName || authUser.email || "U").trim().charAt(0).toLocaleUpperCase("tr-TR")
        : ""

    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                background: C.bg,
                fontFamily: SANS,
                color: C.ink,
            }}
        >
            <style>{`
                .sa-nav-wrap {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 18px 24px 0;
                    box-sizing: border-box;
                    position: relative;
                }
                .sa-nav {
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px 0 16px;
                }
                .sa-link {
                    color: ${C.ink};
                    text-decoration: none;
                    opacity: 0.9;
                    font-size: 14px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                .sa-link:hover { opacity: 1; }
                .sa-navlinks { display: flex; gap: 24px; align-items: center; }
                .sa-burger { display: none; }
                .sa-container {
                    width: 100%;
                    max-width: 1060px;
                    margin: 0 auto;
                    padding: 48px 24px 76px;
                    box-sizing: border-box;
                    flex: 1;
                }
                .sa-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-top: 28px;
                }
                .sa-card {
                    padding: 22px;
                    border-radius: 22px;
                    background: rgba(255, 255, 255, 0.78);
                    border: 1px solid rgba(255, 255, 255, 0.92);
                    box-shadow: 0 18px 40px -22px rgba(16, 17, 24, 0.16), 0 0 0 1px rgba(16, 17, 20, 0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .sa-upcoming-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 10px;
                    margin-top: 16px;
                }
                @media (max-width: 960px) {
                    .sa-grid { grid-template-columns: repeat(2, 1fr); }
                    .sa-upcoming-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 760px) {
                    .sa-nav-wrap { padding: 8px 12px 0; }
                    .sa-navlinks, .sa-desktop-auth { display: none !important; }
                    .sa-burger { display: flex; align-items: center; gap: 8px; }
                    .sa-container { padding: 34px 18px 56px; }
                    .sa-grid { grid-template-columns: 1fr; }
                    .sa-upcoming-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>

            {/* Üst Menü */}
            <div className="sa-nav-wrap">
                <nav className="sa-nav" aria-label="Main">
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
                    </a>

                    <div className="sa-navlinks">
                        <a className="sa-link" href="/#tarife">Tarifeler</a>
                        <a className="sa-link" href="/hizmet-bolgeleri" style={{ fontWeight: 700, opacity: 1, color: C.accent }}>Hizmet Bölgeleri</a>
                        <a className="sa-link" href="/bizimle-calisin">Bizimle Çalışın</a>
                        <a className="sa-link" href="/hakkimizda">Hakkımızda</a>
                    </div>

                    <div className="sa-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {authUser ? (
                            <a
                                href="/giris"
                                aria-label="Profil"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 999,
                                    background: C.ink,
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                {userInitial}
                            </a>
                        ) : (
                            <a
                                href="/giris"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    border: "1px solid rgba(16, 17, 20, 0.14)",
                                    background: "rgba(255, 255, 255, 0.78)",
                                    color: C.ink,
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: 13.5,
                                }}
                            >
                                Giriş Yap
                            </a>
                        )}
                    </div>

                    <div className="sa-burger">
                        {authUser && (
                            <a
                                href="/giris"
                                aria-label="Profil"
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 999,
                                    background: C.ink,
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                {userInitial}
                            </a>
                        )}
                        <button
                            type="button"
                            aria-label="Menüyü Aç"
                            onClick={() => setMenuOpen((o) => !o)}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 999,
                                border: 0,
                                background: menuOpen ? "rgba(16, 17, 20, 0.12)" : "rgba(16, 17, 20, 0.06)",
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            {menuOpen ? (
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M6 18L18 6M6 6l12 12" fill="none" stroke="#101114" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M4 8h16M4 16h16" fill="none" stroke="#101114" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <div
                        style={{
                            position: "absolute",
                            right: 12,
                            top: 64,
                            width: "min(232px, calc(100vw - 24px))",
                            borderRadius: 16,
                            background: "rgba(252, 251, 248, 0.98)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "rgba(30, 28, 20, 0.24) 0px 18px 38px -14px, rgba(16, 17, 20, 0.08) 0px 0px 0px 1px",
                            padding: "6px 7px",
                            zIndex: 100,
                        }}
                    >
                        {[
                            { title: "Ana Sayfa", desc: "Taksi çağır", href: "/" },
                            { title: "Tarifeler", desc: "İndi-bindi & km ücreti", href: "/#tarife" },
                            { title: "Hizmet Bölgeleri", desc: "Elazığ & tüm ilçeler", href: "/hizmet-bolgeleri" },
                            { title: "Bizimle Çalışın", desc: "Taksici olarak katıl", href: "/bizimle-calisin" },
                            { title: "Hakkımızda", desc: "Paytaksi bilgi", href: "/hakkimizda" },
                        ].map((item) => (
                            <a
                                key={item.title}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: "block",
                                    padding: "8px 10px",
                                    borderRadius: 11,
                                    color: C.ink,
                                    textDecoration: "none",
                                    borderBottom: "1px solid rgba(16, 17, 20, 0.05)",
                                }}
                            >
                                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.title}</div>
                                <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{item.desc}</div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="sa-container">
                {/* Üst Rozet ve Başlık */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(14, 138, 95, 0.10)", border: "1px solid rgba(14, 138, 95, 0.22)", fontSize: 12, fontWeight: 700, color: C.ok }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: C.ok, display: "inline-block" }} />
                    AKTİF HİZMET BÖLGESİ · ELAZIĞ (7/24)
                </div>

                <h1 style={{ margin: "14px 0 0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
                    Hizmet Verdiğimiz Bölgeler
                </h1>
                <p style={{ margin: "14px 0 0", maxWidth: 680, fontSize: 16, lineHeight: 1.6, color: C.ink2 }}>
                    PayTaksi şu anda <b>Elazığ merkez, tüm mahalleler, havalimanı, hastaneler, üniversite kampüsü ve ilçelerde</b> 7/24 sabit fiyat garantisiyle aktif olarak hizmet vermektedir.
                </p>

                {/* Elazığ Aktif Bölgeler Grid */}
                <div className="sa-grid">
                    {ACTIVE_ZONES.map((z) => (
                        <div key={z.title} className="sa-card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>{z.title}</div>
                                <span
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: "4px 9px",
                                        borderRadius: 999,
                                        background: "rgba(58, 58, 244, 0.10)",
                                        color: C.accent,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {z.eta}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: C.ink2 }}>{z.desc}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto", paddingTop: 4 }}>
                                {z.areas.map((a) => (
                                    <span
                                        key={a}
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: "rgba(16, 17, 20, 0.05)",
                                            color: C.ink,
                                        }}
                                    >
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Yakında Açılacak Şehirler */}
                <div
                    style={{
                        marginTop: 36,
                        padding: 26,
                        borderRadius: 24,
                        background: "rgba(255, 255, 255, 0.72)",
                        border: "1px solid rgba(255, 255, 255, 0.92)",
                        boxShadow: "0 18px 40px -22px rgba(16, 17, 24, 0.14), 0 0 0 1px rgba(16, 17, 20, 0.06)",
                    }}
                >
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.06em" }}>
                                GENİŞLEME PLANI
                            </div>
                            <h2 style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em" }}>
                                Çok Yakında Hizmet Vereceğimiz Şehirler
                            </h2>
                        </div>
                        <a
                            href="/"
                            style={{
                                padding: "11px 18px",
                                borderRadius: 14,
                                background: C.accent,
                                color: "#fff",
                                textDecoration: "none",
                                fontSize: 13.5,
                                fontWeight: 700,
                                boxShadow: "0 10px 22px -8px rgba(58, 58, 244, 0.5)",
                            }}
                        >
                            Elazığ'da Hemen Taksi Çağır →
                        </a>
                    </div>

                    <div className="sa-upcoming-grid">
                        {UPCOMING_CITIES.map((city) => (
                            <div
                                key={city.name}
                                style={{
                                    padding: "13px 14px",
                                    borderRadius: 14,
                                    background: "#FFFFFF",
                                    border: `1px solid ${C.line}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{city.name}</div>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>{city.tag}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
