import * as React from "react"

const C = {
    bg: "#F1EFEA",
    surface: "#F8F7F4",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16, 17, 20, 0.09)",
    accent: "#3A3AF4",
}

const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

export default function Footer() {
    return (
        <footer
            id="hakkimizda"
            style={{
                width: "100%",
                background: C.surface,
                borderTop: `1px solid ${C.line}`,
                fontFamily: SANS,
                color: C.ink,
                boxSizing: "border-box",
            }}
        >
            <style>{`
                .pt-ft-wrap {
                    max-width: 1180px;
                    margin: 0 auto;
                    padding: 64px 28px 36px;
                    box-sizing: border-box;
                }
                .pt-ft-top {
                    display: grid;
                    grid-template-columns: minmax(260px, 1.35fr) repeat(3, minmax(140px, 1fr));
                    gap: 44px 36px;
                    align-items: start;
                }
                .pt-ft-col-title {
                    margin: 0 0 14px;
                    font-size: 13.5px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: ${C.ink};
                }
                .pt-ft-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pt-ft-link {
                    color: ${C.ink2};
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.18s ease;
                }
                .pt-ft-link:hover {
                    color: ${C.ink};
                }
                .pt-ft-social {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid ${C.line};
                    background: #fff;
                    color: ${C.ink};
                    display: grid;
                    place-items: center;
                    text-decoration: none;
                    transition: border-color 0.2s ease, transform 0.2s ease, color 0.2s ease;
                }
                .pt-ft-social:hover {
                    border-color: rgba(58, 58, 244, 0.35);
                    color: ${C.accent};
                    transform: translateY(-2px);
                }
                .pt-ft-bottom {
                    margin-top: 52px;
                    padding-top: 22px;
                    border-top: 1px solid ${C.line};
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px 24px;
                    font-size: 13px;
                    color: ${C.ink2};
                }
                @media (max-width: 860px) {
                    .pt-ft-top {
                        grid-template-columns: 1fr 1fr;
                        gap: 32px 24px;
                    }
                    .pt-ft-brand {
                        grid-column: 1 / -1;
                    }
                }
                @media (max-width: 520px) {
                    .pt-ft-wrap {
                        padding: 44px 20px 28px;
                    }
                    .pt-ft-top {
                        grid-template-columns: 1fr;
                        gap: 28px;
                    }
                }
            `}</style>

            <div className="pt-ft-wrap">
                <div className="pt-ft-top">
                    {/* Brand */}
                    <div className="pt-ft-brand" style={{ maxWidth: 320 }}>
                        <a
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 9,
                                fontWeight: 700,
                                fontSize: 18,
                                letterSpacing: "-0.03em",
                                color: C.ink,
                                textDecoration: "none",
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="10" width="18" height="7.5" rx="2.5" fill="none" stroke="#101114" strokeWidth="1.8" />
                                <path d="M6 10L8 5.5h8l2 4.5" fill="none" stroke="#101114" strokeWidth="1.8" strokeLinejoin="round" />
                                <rect x="10" y="3.5" width="4" height="2" rx="0.8" fill="#F5B800" stroke="#101114" strokeWidth="1" />
                                <circle cx="7" cy="17.5" r="2.2" fill="#101114" />
                                <circle cx="17" cy="17.5" r="2.2" fill="#101114" />
                                <circle cx="12" cy="12.8" r="1.8" fill="#3A3AF4" />
                            </svg>
                            PayTaksi
                        </a>
                        <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.55, color: C.ink2 }}>
                            Elazığ'da sabit fiyat garantisiyle hızlı, güvenilir ve üyelere özel %15 indirimli 7/24 taksi çağırma platformu.
                        </p>
                        <div style={{ marginTop: 12, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
                            <div><b style={{ color: C.ink }}>Destek Hattı:</b> <a href="tel:+905011366815" style={{ color: C.ink, textDecoration: "none", fontWeight: 600 }}>0501 136 68 15</a></div>
                            <div><b style={{ color: C.ink }}>E-posta:</b> <a href="mailto:destek@paytaksi.com.tr" style={{ color: C.ink2, textDecoration: "none" }}>destek@paytaksi.com.tr</a></div>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                            <a aria-label="Instagram" className="pt-ft-social" href="https://instagram.com" target="_blank" rel="noreferrer">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                                    <circle cx="12" cy="12" r="4.2" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                            <a aria-label="X" className="pt-ft-social" href="https://x.com" target="_blank" rel="noreferrer">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a aria-label="YouTube" className="pt-ft-social" href="https://youtube.com" target="_blank" rel="noreferrer">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="4" />
                                    <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                            <a aria-label="LinkedIn" className="pt-ft-social" href="https://linkedin.com" target="_blank" rel="noreferrer">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 1: Hizmetler */}
                    <div>
                        <p className="pt-ft-col-title">Hizmetler</p>
                        <ul className="pt-ft-list">
                            <li><a className="pt-ft-link" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}>Taksi Çağır</a></li>
                            <li><a className="pt-ft-link" href="#tarife" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}>Tarifeler</a></li>
                            <li><a className="pt-ft-link" href="/giris">Giriş Yap</a></li>
                            <li><a className="pt-ft-link" href="/kayit">Hesap Oluştur</a></li>
                        </ul>
                    </div>

                    {/* Column 2: Kurumsal */}
                    <div>
                        <p className="pt-ft-col-title">Kurumsal</p>
                        <ul className="pt-ft-list">
                            <li><a className="pt-ft-link" href="/hakkimizda">Hakkımızda</a></li>
                            <li><a className="pt-ft-link" href="/bizimle-calisin">Bizimle Çalışın</a></li>
                            <li><a className="pt-ft-link" href="/surucu">Sürücü Paneli</a></li>
                            <li><a className="pt-ft-link" href="/iletisim">İletişim</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Yasal */}
                    <div>
                        <p className="pt-ft-col-title">Yasal</p>
                        <ul className="pt-ft-list">
                            <li><a className="pt-ft-link" href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a></li>
                            <li><a className="pt-ft-link" href="/iptal-iade">İptal ve İade Politikası</a></li>
                            <li><a className="pt-ft-link" href="/kullanim-kosullari">Kullanım Koşulları</a></li>
                            <li><a className="pt-ft-link" href="/gizlilik-politikasi">Gizlilik Politikası</a></li>
                            <li><a className="pt-ft-link" href="/kvkk">KVKK Aydınlatma Metni</a></li>
                            <li><a className="pt-ft-link" href="/cerez-politikasi">Çerez Politikası</a></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-ft-bottom">
                    <div>© 2026 PayTaksi. Tüm hakları saklıdır. · Merkez / Elazığ</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        {/* PayTR Logo Badge */}
                        <span
                            title="PayTR Güvenli Ödeme"
                            style={{
                                height: 30,
                                padding: "0 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <svg width="54" height="16" viewBox="0 0 108 32" aria-label="PayTR">
                                <rect x="0" y="4" width="24" height="24" rx="6" fill="#0B5CAD" />
                                <path d="M7 16.5l3.5 3.5 6.5-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                <text x="30" y="23" fontFamily="'Inter Tight', 'Inter', sans-serif" fontWeight="800" fontSize="21" letterSpacing="-0.6" fill="#101114">
                                    Pay<tspan fill="#0B5CAD">TR</tspan>
                                </text>
                            </svg>
                        </span>

                        {/* VISA Logo Badge */}
                        <span
                            title="VISA"
                            style={{
                                height: 30,
                                padding: "0 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                            }}
                        >
                            <svg width="42" height="14" viewBox="0 0 84 28" aria-label="VISA">
                                <text x="2" y="22" fontFamily="'Inter Tight', 'Arial Black', sans-serif" fontWeight="900" fontStyle="italic" fontSize="25" letterSpacing="-1" fill="#1A1F71">
                                    VISA
                                </text>
                                <path d="M4 4h11l3 5" fill="none" stroke="#F7B600" strokeWidth="2.6" strokeLinecap="round" />
                            </svg>
                        </span>

                        {/* Mastercard Logo Badge */}
                        <span
                            title="Mastercard"
                            style={{
                                height: 30,
                                padding: "0 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <svg width="30" height="18" viewBox="0 0 36 22" aria-label="Mastercard">
                                <circle cx="13" cy="11" r="9" fill="#EB001B" />
                                <circle cx="23" cy="11" r="9" fill="#F79E1B" fillOpacity="0.9" />
                            </svg>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>mastercard</span>
                        </span>

                        {/* TROY Logo Badge */}
                        <span
                            title="TROY Türkiye'nin Ödeme Yöntemi"
                            style={{
                                height: 30,
                                padding: "0 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                            }}
                        >
                            <svg width="46" height="16" viewBox="0 0 92 32" aria-label="TROY">
                                <text x="2" y="23" fontFamily="'Inter Tight', 'Inter', sans-serif" fontWeight="900" fontSize="23" letterSpacing="-0.5" fill="#003865">
                                    troy
                                </text>
                                <circle cx="67" cy="15" r="7.5" fill="#00A3E0" />
                                <path d="M64 15l2.2 2.2 4.5-4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>

                        {/* 256-Bit SSL Badge */}
                        <span
                            title="256-Bit SSL Güvenli Bağlantı"
                            style={{
                                height: 30,
                                padding: "0 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#0E8A5F",
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E8A5F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="11" width="16" height="10" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                            </svg>
                            256-Bit SSL
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
