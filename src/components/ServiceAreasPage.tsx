import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Footer from "./Footer"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16, 17, 20, 0.09)",
    accent: "#3A3AF4",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', monospace"

type CatKey = "all" | "merkez" | "havalimani" | "hastane" | "avm" | "kampus" | "turistik" | "ilceler"

const CATEGORIES: { key: CatKey; label: string; path: string }[] = [
    {
        key: "all",
        label: "Tümü",
        path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18",
    },
    {
        key: "merkez",
        label: "Şehir Merkezi",
        path: "M3 21h18M5 21V8l5-3v16M10 21V10h9v11M13 13h3M13 16h3M7 11h1M7 14h1",
    },
    {
        key: "havalimani",
        label: "Havalimanı",
        path: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    },
    {
        key: "hastane",
        label: "Hastaneler",
        path: "M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M2 20h20M12 8v6M9 11h6M9 20v-4h6v4",
    },
    {
        key: "avm",
        label: "AVM & Yaşam",
        path: "M6 7h12l1 13H5L6 7zM9 7V5a3 3 0 0 1 6 0v2",
    },
    {
        key: "kampus",
        label: "Üniversite",
        path: "M2 10l10-5 10 5-10 5-10-5zM6 12v5c0 1.8 2.7 3 6 3s6-1.2 6-3v-5",
    },
    {
        key: "turistik",
        label: "Harput & Göl",
        path: "M2 20l7-12 4 6 3-4 6 10zM9 8l2 3",
    },
    {
        key: "ilceler",
        label: "İlçeler",
        path: "M4 20V10l5-4 5 4v10M14 20v-7h6v7M2 20h20M9 20v-4",
    },
]

interface AreaItem {
    slug: string
    title: string
    district: string
    price: string
    eta: string
    img: string
    cats: CatKey[]
}

const SERVICE_AREAS: AreaItem[] = [
    {
        slug: "carsi-gazi-cd",
        title: "Çarşı · Gazi Caddesi & İzzetpaşa",
        district: "Elazığ Merkez · ~2 dk",
        price: "250 TL",
        eta: "~2 dk",
        img: "/places/elazig-merkez.jpg",
        cats: ["merkez", "avm"],
    },
    {
        slug: "elysium-park-avm",
        title: "Elysium Park AVM & Çaydaçıra",
        district: "Çaydaçıra · Ataşehir",
        price: "250 TL",
        eta: "~3 dk",
        img: "/places/elysium.webp",
        cats: ["avm", "merkez"],
    },
    {
        slug: "elazig-havalimani",
        title: "Elazığ Havalimanı (EZS) Transfer",
        district: "Akçakiraz · Terminal",
        price: "490 TL",
        eta: "~5 dk",
        img: "/places/havalimani.webp",
        cats: ["havalimani"],
    },
    {
        slug: "fethi-sekin-sehir-hastanesi",
        title: "Fethi Sekin Şehir Hastanesi",
        district: "Doğukent · Acil & Poliklinik",
        price: "270 TL",
        eta: "~3 dk",
        img: "/places/sehir-hastanesi.avif",
        cats: ["hastane"],
    },
    {
        slug: "harput-kalesi-hilton",
        title: "Harput Kalesi & Tarihi Merkez",
        district: "Harput · Seyir & Oteller",
        price: "350 TL",
        eta: "~6 dk",
        img: "/places/harput-kalesi.jpg",
        cats: ["turistik"],
    },
    {
        slug: "firat-universitesi",
        title: "Fırat Üniversitesi & Tıp Merkezi",
        district: "Üniversite Mah. · Kampüs",
        price: "250 TL",
        eta: "~2 dk",
        img: "/places/firat-universitesi.jpg",
        cats: ["kampus", "hastane"],
    },
    {
        slug: "kultur-park-caydacira",
        title: "Kültür Park & Abdullahpaşa",
        district: "Malatya Yolu · Batı Elazığ",
        price: "270 TL",
        eta: "~4 dk",
        img: "/places/kultur-park.jpg",
        cats: ["merkez", "avm"],
    },
    {
        slug: "hazar-golu-sivrice",
        title: "Hazar Gölü & Sivrice Sahil",
        district: "Sivrice · Plaj & Tesisler",
        price: "950 TL",
        eta: "Planlı",
        img: "/places/hazar-golu.jpg",
        cats: ["turistik", "ilceler"],
    },
    {
        slug: "elazig-ilceler",
        title: "Keban · Kovancılar · Baskil · Palu",
        district: "Tüm Elazığ İlçeleri",
        price: "45 TL / km",
        eta: "7/24",
        img: "/places/keban-baraji.jpg",
        cats: ["ilceler"],
    },
]

export function ServiceAreasSection() {
    const [activeCat, setActiveCat] = useState<CatKey>("all")
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const [indicator, setIndicator] = useState({ left: 0, width: 58 })

    const filtered = activeCat === "all" ? SERVICE_AREAS : SERVICE_AREAS.filter((item) => item.cats.includes(activeCat))

    useLayoutEffect(() => {
        const updateInd = () => {
            const btn = tabRefs.current[activeCat]
            if (btn) {
                setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
            }
        }
        updateInd()
        window.addEventListener("resize", updateInd)
        return () => window.removeEventListener("resize", updateInd)
    }, [activeCat])

    const activeCatLabel = CATEGORIES.find((c) => c.key === activeCat)?.label ?? "Tümü"

    return (
        <section
            id="hizmet-bolgeleri"
            style={{
                width: "100%",
                maxWidth: 1240,
                margin: "0 auto",
                position: "relative",
                fontFamily: SANS,
                color: C.ink,
                padding: "72px 40px",
                boxSizing: "border-box",
            }}
        >
            <style>{`
                @keyframes ssCatIn {
                    from { opacity: 0; transform: translateY(14px) scale(.98); }
                    to { opacity: 1; transform: none; }
                }
                .pt-sa-tabs::-webkit-scrollbar { display: none; }
                .pt-sa-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0px, 1fr));
                    gap: 18px;
                    margin-top: 22px;
                }
                .pt-sa-card img {
                    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .pt-sa-card:hover img {
                    transform: scale(1.04);
                }
                @media (max-width: 900px) {
                    .pt-sa-grid {
                        grid-template-columns: repeat(2, minmax(0px, 1fr));
                    }
                }
                @media (max-width: 600px) {
                    #hizmet-bolgeleri {
                        padding: 48px 18px !important;
                    }
                    .pt-sa-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .pt-sa-card { animation: none !important; }
                }
            `}</style>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-0.035em" }}>
                    Hizmet verdiğimiz bölgeler
                </h2>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.ink2 }}>
                    {filtered.length} / {SERVICE_AREAS.length} bölge · Elazığ 7/24
                </span>
            </div>

            {/* Kategori Sekmeleri */}
            <div
                role="tablist"
                aria-label="Hizmet bölgeleri kategorileri"
                className="pt-sa-tabs"
                style={{
                    position: "relative",
                    display: "flex",
                    gap: 6,
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    paddingBottom: 12,
                    borderBottom: `1px solid ${C.line}`,
                }}
            >
                {CATEGORIES.map((cat) => {
                    const selected = activeCat === cat.key
                    return (
                        <button
                            key={cat.key}
                            ref={(el) => {
                                tabRefs.current[cat.key] = el
                            }}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setActiveCat(cat.key)}
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
                                background: selected ? "rgba(255, 255, 255, 0.72)" : "transparent",
                                color: selected ? C.ink : C.ink2,
                                fontFamily: SANS,
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "background 0.2s ease, color 0.2s ease",
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none", display: "block" }}>
                                <path
                                    d={cat.path}
                                    fill="none"
                                    stroke={selected ? C.ink : C.ink2}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {cat.label}
                        </button>
                    )
                })}

                {/* Kayan Alt Çizgi Göstergesi */}
                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: -1,
                        left: indicator.left,
                        width: indicator.width,
                        height: 2,
                        background: C.ink,
                        borderRadius: 2,
                        transition: "left 0.55s cubic-bezier(0.65, 0, 0.35, 1), width 0.55s cubic-bezier(0.65, 0, 0.35, 1)",
                    }}
                />
            </div>

            {/* 3 Sütunlu Kart Izgarası */}
            <div className="pt-sa-grid" key={activeCat}>
                {filtered.map((item, idx) => (
                    <a
                        key={item.slug}
                        href="/"
                        className="pt-sa-card"
                        style={{
                            color: C.ink,
                            textDecoration: "none",
                            animation: `0.7s cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * 70}ms 1 normal both running ssCatIn`,
                        }}
                    >
                        <div
                            style={{
                                borderRadius: 16,
                                overflow: "hidden",
                                aspectRatio: "4 / 3",
                                background: "#E8E5DD",
                                position: "relative",
                            }}
                        >
                            <img
                                src={item.img}
                                alt={item.title}
                                loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: "-0.015em",
                                marginTop: 9,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {item.title}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 8,
                                fontSize: 13,
                                color: C.ink2,
                                marginTop: 2,
                                whiteSpace: "nowrap",
                                height: 18,
                                overflow: "hidden",
                            }}
                        >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.district}</span>
                            <span style={{ fontFamily: MONO, flex: "0 0 auto" }}>{item.price}</span>
                        </div>
                    </a>
                ))}

                {/* Son Kesikli Çizgili Kart */}
                {activeCat !== "all" ? (
                    <button
                        type="button"
                        onClick={() => setActiveCat("all")}
                        style={{
                            boxSizing: "border-box",
                            overflow: "hidden",
                            alignSelf: "start",
                            borderRadius: 16,
                            border: "1px dashed rgba(16, 17, 20, 0.2)",
                            background: "transparent",
                            aspectRatio: "4 / 3",
                            display: "grid",
                            placeItems: "center",
                            textAlign: "center",
                            color: C.ink2,
                            fontFamily: SANS,
                            fontSize: 13.5,
                            cursor: "pointer",
                            padding: 16,
                        }}
                    >
                        <span>
                            {activeCatLabel} kategorisindeki tüm bölgeler bunlar.
                            <br />
                            <span style={{ color: C.ink, fontWeight: 600 }}>Tüm bölgeleri gör →</span>
                        </span>
                    </button>
                ) : (
                    <a
                        href="/"
                        style={{
                            boxSizing: "border-box",
                            overflow: "hidden",
                            alignSelf: "start",
                            borderRadius: 16,
                            border: "1px dashed rgba(16, 17, 20, 0.2)",
                            aspectRatio: "4 / 3",
                            display: "grid",
                            placeItems: "center",
                            textAlign: "center",
                            color: C.ink2,
                            fontSize: 13.5,
                            textDecoration: "none",
                            padding: 16,
                        }}
                    >
                        <span>
                            Elazığ dışındaki şehirler çok yakında.
                            <br />
                            <span style={{ color: C.ink, fontWeight: 600 }}>Hemen taksi çağır →</span>
                        </span>
                    </a>
                )}
            </div>
        </section>
    )
}

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
                @media (max-width: 760px) {
                    .sa-nav-wrap { padding: 8px 12px 0; }
                    .sa-navlinks, .sa-desktop-auth { display: none !important; }
                    .sa-burger { display: flex; align-items: center; gap: 8px; }
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

            <div style={{ flex: 1 }}>
                <ServiceAreasSection />
            </div>

            <Footer />
        </div>
    )
}
