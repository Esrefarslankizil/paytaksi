import * as React from "react"
import { useEffect, useState } from "react"
import Footer from "./Footer"

const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16, 17, 20, 0.09)",
    accent: "#3A3AF4",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

export default function AboutPage() {
    const [authUser, setAuthUser] = useState<{ fullName?: string; email?: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const getApiUrl = () => {
        const envUrl = (import.meta as any).env?.VITE_API_URL
        if (envUrl) return String(envUrl).replace(/\/$/, "")
        const h = window.location.hostname
        if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
            return `http://${h}:5080`
        return "https://api.paytaksi.com.tr"
    }

    useEffect(() => {
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
                .ab-nav-wrap {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 12px 24px 0;
                    box-sizing: border-box;
                    position: sticky;
                    top: 0;
                    z-index: 60;
                }
                .ab-nav {
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px 0 16px;
                    background: rgba(252, 251, 248, 0);
                    backdrop-filter: none;
                    box-shadow: none;
                    transition: background 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .ab-nav.is-scrolled {
                    background: rgba(252, 251, 248, 0.84);
                    backdrop-filter: blur(18px) saturate(1.3);
                    -webkit-backdrop-filter: blur(18px) saturate(1.3);
                    box-shadow: rgba(16, 17, 20, 0.06) 0px 0px 0px 1px, rgba(30, 28, 20, 0.35) 0px 10px 30px -18px;
                }
                .ab-link {
                    color: ${C.ink};
                    text-decoration: none;
                    opacity: 0.9;
                    font-size: 14px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                .ab-link:hover {
                    opacity: 1;
                }
                .ab-navlinks {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .ab-burger {
                    display: none;
                }
                .ab-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 56px 24px 72px;
                    box-sizing: border-box;
                    flex: 1;
                }
                .ab-title {
                    margin: 0;
                    font-size: clamp(2.1rem, 4vw, 3rem);
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    color: ${C.ink};
                }
                .ab-prose {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    font-size: 16.5px;
                    line-height: 1.72;
                    color: ${C.ink2};
                }
                .ab-prose p {
                    margin: 0;
                }
                @media (max-width: 760px) {
                    .ab-nav-wrap {
                        padding: 8px 12px 0;
                    }
                    .ab-navlinks, .ab-desktop-auth {
                        display: none !important;
                    }
                    .ab-burger {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .ab-container {
                        padding: 40px 20px 56px;
                    }
                }
            `}</style>

            {/* Üst Menü (Ana sayfa ile birebir aynı şablon) */}
            <div className="ab-nav-wrap">
                <nav className={`ab-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Main">
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

                    <div className="ab-navlinks">
                        <a className="ab-link" href="/#tarife">
                            Tarifeler
                        </a>
                        <a className="ab-link" href="/bizimle-calisin">
                            Bizimle Çalışın
                        </a>
                        <a className="ab-link" href="/hakkimizda" style={{ fontWeight: 700, opacity: 1 }}>
                            Hakkımızda
                        </a>
                    </div>

                    <div className="ab-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {authUser ? (
                            <a
                                href="/giris"
                                aria-label="Profil"
                                title={authUser.fullName || authUser.email || "Profil"}
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
                                    boxShadow: "0 4px 12px -4px rgba(16,17,20,0.35)",
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

                    {/* Mobil sağ butonlar */}
                    <div className="ab-burger">
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
                            { title: "Bizimle Çalışın", desc: "Taksici olarak katıl", href: "/#bizimle-calisin" },
                            { title: "Hakkımızda", desc: "Paytaksi bilgi", href: "/hakkimizda" },
                        ].map((item) => (
                            <a
                                key={item.title}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 10px",
                                    borderRadius: 11,
                                    color: C.ink,
                                    textDecoration: "none",
                                    borderBottom: "1px solid rgba(16, 17, 20, 0.05)",
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.02em" }}>{item.title}</div>
                                    <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{item.desc}</div>
                                </div>
                            </a>
                        ))}
                        {!authUser && (
                            <div style={{ padding: "8px 4px 3px" }}>
                                <a
                                    href="/giris"
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "center",
                                        padding: "8px 0",
                                        borderRadius: 10,
                                        background: C.ink,
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#fff",
                                        textDecoration: "none",
                                    }}
                                >
                                    Giriş Yap
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sade Hakkımızda İçeriği */}
            <div className="ab-container">
                <h1 className="ab-title">Hakkımızda</h1>
                <article className="ab-prose">
                    <p>
                        Elazığ'ın yeni nesil taksi çağırma platformu olarak yola çıktık. Kurulduğumuz günden bu yana yolcularımıza güvenilir, hızlı, şeffaf ve pratik bir şehir içi ulaşım deneyimi sunmak için çalışıyoruz. Teknolojiyi hizmetlerimizin merkezine koyarak taksi ulaşımını daha erişilebilir ve modern bir hale getiriyoruz.
                    </p>
                    <p>
                        Bugün, Elazığ genelinde binlerce yolculuğun dijital ev sahibi olarak, kullanıcılarımızı şehrin resmi ticari plakalı ve deneyimli sürücüleriyle saniyeler içinde buluşturuyoruz.
                    </p>
                    <p>
                        Yolculuk öncesinde sunduğumuz sabit fiyat garantisiyle sürpriz ücretleri ortadan kaldırıyor; üyelerimize özel anında %15 indirim avantajıyla bütçe dostu bir ulaşım sağlıyoruz.
                    </p>
                    <p>
                        İster üye girişiyle indirimli, ister araçta nakit ödeme kolaylığıyla; Havalimanı'ndan Fethi Sekin Şehir Hastanesi'ne, Harput'tan Çarşı merkezine kadar Elazığ'ın her noktasına 7/24 kesintisiz erişim sunuyoruz.
                    </p>
                    <p>
                        Her adımda daha konforlu, güvenli ve yenilikçi bir ulaşım deneyimi sunmayı hedefliyoruz.
                    </p>
                    <p style={{ fontWeight: 600, color: C.ink }}>
                        Şimdiden iyi yolculuklar!
                    </p>
                </article>
            </div>

            <Footer />
        </div>
    )
}
