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

export default function PartnerPage() {
    const [authUser, setAuthUser] = useState<{ fullName?: string; email?: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])
    const [form, setForm] = useState({ name: "", phone: "", plate: "" })
    const [sent, setSent] = useState(false)

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
                .pp-nav-wrap {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 12px 24px 0;
                    box-sizing: border-box;
                    position: sticky;
                    top: 0;
                    z-index: 60;
                }
                .pp-nav {
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
                .pp-nav.is-scrolled {
                    background: rgba(252, 251, 248, 0.84);
                    backdrop-filter: blur(18px) saturate(1.3);
                    -webkit-backdrop-filter: blur(18px) saturate(1.3);
                    box-shadow: rgba(16, 17, 20, 0.06) 0px 0px 0px 1px, rgba(30, 28, 20, 0.35) 0px 10px 30px -18px;
                }
                .pp-link {
                    color: ${C.ink};
                    text-decoration: none;
                    opacity: 0.9;
                    font-size: 14px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                .pp-link:hover {
                    opacity: 1;
                }
                .pp-navlinks {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .pp-burger {
                    display: none;
                }
                .pp-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 56px 24px 72px;
                    box-sizing: border-box;
                    flex: 1;
                }
                .pp-title {
                    margin: 0;
                    font-size: clamp(2.1rem, 4vw, 3rem);
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    color: ${C.ink};
                }
                .pp-prose {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    font-size: 16.5px;
                    line-height: 1.72;
                    color: ${C.ink2};
                }
                .pp-prose p {
                    margin: 0;
                }
                .pp-form-card {
                    margin-top: 36px;
                    padding: 26px 24px;
                    border-radius: 26px;
                    background: rgba(255, 255, 255, 0.78);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 24px 60px -24px rgba(16, 17, 24, 0.2), 0 0 0 1px rgba(16, 17, 20, 0.06), inset 0 1px 0 #fff;
                }
                .pp-form-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                }
                .pp-field {
                    display: flex;
                    flex-direction: column;
                    padding: 10px 14px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.72);
                    border: 1px solid rgba(16, 17, 20, 0.1);
                }
                .pp-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #6B6D75;
                }
                .pp-input {
                    border: 0;
                    outline: none;
                    background: transparent;
                    font-family: ${SANS};
                    font-size: 15.5px;
                    font-weight: 500;
                    color: ${C.ink};
                    margin-top: 3px;
                    padding: 0;
                }
                .pp-submit {
                    margin-top: 14px;
                    width: 100%;
                    padding: 14px 18px;
                    border-radius: 16px;
                    border: 0;
                    cursor: pointer;
                    font-family: ${SANS};
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    background: linear-gradient(180deg, #5050FF 0%, ${C.accent} 55%, #2E2EDC 100%);
                    box-shadow: 0 14px 30px -10px rgba(58, 58, 244, 0.55);
                }
                @media (max-width: 760px) {
                    .pp-nav-wrap {
                        padding: 8px 12px 0;
                    }
                    .pp-navlinks, .pp-desktop-auth {
                        display: none !important;
                    }
                    .pp-burger {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .pp-container {
                        padding: 40px 20px 56px;
                    }
                    .pp-form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Üst Menü */}
            <div className="pp-nav-wrap">
                <nav className={`pp-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Main">
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

                    <div className="pp-navlinks">
                        <a className="pp-link" href="/#tarife">
                            Tarifeler
                        </a>
                        <a className="pp-link" href="/bizimle-calisin" style={{ fontWeight: 700, opacity: 1 }}>
                            Bizimle Çalışın
                        </a>
                        <a className="pp-link" href="/hakkimizda">
                            Hakkımızda
                        </a>
                    </div>

                    <div className="pp-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                    <div className="pp-burger">
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
                            { title: "Bizimle Çalışın", desc: "Taksici olarak katıl", href: "/bizimle-calisin" },
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

            {/* Sade Bizimle Çalışın İçeriği */}
            <div className="pp-container">
                <h1 className="pp-title">Bizimle Çalışın</h1>
                <article className="pp-prose">
                    <p>
                        Elazığ'ın resmi <b>23 T</b> plakalı taksi kaptanlarını dijital çağın hızıyla buluşturuyoruz. PayTaksi ailesine katılarak durakta saatlerce sıra bekleme veya yolcu bıraktıktan sonra boş dönme derdine son verin; konumunuza en yakın yolcu çağrılarını doğrudan telefonunuza alın.
                    </p>
                    <p>
                        Sürücülerimizin emeğini her şeyin üstünde tutuyoruz. Bu yüzden <b>sektörün en düşük komisyon oranı</b> ile çalışıyor, kazancınızın büyük kısmının cebinizde kalmasını sağlıyoruz. Üstelik sabit katılım ücreti, aidat veya sürpriz kesintiler olmadan yalnızca tamamladığınız yolculuklar üzerinden şeffaf bir model sunuyoruz.
                    </p>
                    <p>
                        Yolcularımıza sunduğumuz %15 indirim kampanyaları sayesinde Elazığ genelinde yüksek çağrı hacmi oluşturuyor, gün boyu kesintisiz iş akışı sağlıyoruz. Nakit yolculuklarda ödemenizi anında araçta alırken, cüzdanlı yolculuklarda hak edişlerinizi gecikmesiz olarak hesabınıza aktarıyoruz.
                    </p>
                    <p>
                        Kullanımı son derece basit sürücü panelimiz ve WhatsApp anlık bildirim desteğimizle hiçbir ek cihaza ihtiyaç duymadan, kendi telefonunuzdan saniyeler içinde çağrı kabul etmeye başlayabilirsiniz.
                    </p>
                    <p style={{ fontWeight: 600, color: C.ink }}>
                        Aşağıdaki formu doldurarak başvurunuzu hemen iletin, aynı gün içinde sizi arayıp hesabınızı aktif edelim. Bol kazançlar ve hayırlı yolculuklar dileriz!
                    </p>
                </article>

                {/* Başvuru Formu */}
                <div className="pp-form-card">
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "10px 6px" }}>
                            <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
                                Başvurunuz alındı!
                            </div>
                            <p style={{ margin: "6px auto 0", fontSize: 14, color: C.ink2 }}>
                                Ekibimiz en kısa sürede <b>{form.phone}</b> numarasından sizinle iletişime geçecektir.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                setSent(true)
                            }}
                        >
                            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>
                                Hızlı Sürücü Başvurusu
                            </div>
                            <div className="pp-form-grid">
                                <label className="pp-field">
                                    <span className="pp-label">Ad Soyad</span>
                                    <input
                                        className="pp-input"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ahmet Yılmaz"
                                    />
                                </label>
                                <label className="pp-field">
                                    <span className="pp-label">Telefon Numarası</span>
                                    <input
                                        className="pp-input"
                                        type="tel"
                                        inputMode="tel"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="05XX XXX XX XX"
                                    />
                                </label>
                                <label className="pp-field">
                                    <span className="pp-label">Taksi Plakası</span>
                                    <input
                                        className="pp-input"
                                        required
                                        value={form.plate}
                                        onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                                        placeholder="23 T 0000"
                                    />
                                </label>
                            </div>
                            <button type="submit" className="pp-submit">
                                Başvuruyu Gönder
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
