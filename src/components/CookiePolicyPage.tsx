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

const COOKIE_ROWS = [
    {
        name: "paytaksi_jwt_token",
        provider: "paytaksi.com.tr",
        purpose: "Kullanıcı oturumunu yönetmek, Google veya e-posta ile giriş yapan yolcu ve sürücülerin kimliğini doğrulamak ve %15 üye indiriminin uygulanmasını sağlamak için kullanılır.",
        duration: "Oturum süresi (12 saat / jeton geçerliliği boyunca)",
        type: "Kesinlikle Gerekli (Zorunlu) Çerezler",
    },
    {
        name: "paytaksi_cash_cooldown",
        provider: "paytaksi.com.tr",
        purpose: "Giriş yapmadan yapılan nakit taksi çağrılarında kötüye kullanımı ve sahte çağrıları önlemek amacıyla son çağrı zamanını tutmak için kullanılır.",
        duration: "1 saat",
        type: "Kesinlikle Gerekli (Zorunlu) Çerezler",
    },
    {
        name: "consent_settings",
        provider: "paytaksi.com.tr",
        purpose: "Ziyaretçinin çerez tercihini saklamak ve çerez bilgilendirme gösterimini yönetmek için kullanılır.",
        duration: "180 gün",
        type: "Kesinlikle Gerekli (Zorunlu) Çerezler",
    },
    {
        name: "G_ENABLED_IDPS / g_state",
        provider: "Google (Google Identity Services)",
        purpose: "Google ile tek dokunuşla güvenli giriş ve kayıt işlemlerinin gerçekleştirilmesi ve oturum durumunun korunması için kullanılır.",
        duration: "Oturum süresi / 6 ay",
        type: "İşlevsellik Çerezleri",
    },
    {
        name: "_GRECAPTCHA",
        provider: "Google",
        purpose: "Giriş ve taksi çağırma adımlarında otomatik (bot) ve kötüye kullanım amaçlı trafiği tespit ederek İnternet Sitesi'nin güvenliğini sağlamak için kullanılır.",
        duration: "6 ay",
        type: "Kesinlikle Gerekli (Zorunlu) Çerezler",
    },
    {
        name: "_ga / _ga_*",
        provider: "Google Analytics",
        purpose: "Ziyaretçileri birbirinden ayırt etmek, oturum bilgisini korumak ve site kullanım istatistiklerini anonim olarak ölçmek için kullanılır.",
        duration: "2 yıl",
        type: "Analitik (Performans) Çerezleri",
    },
]

export default function CookiePolicyPage() {
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
                .cp-nav-wrap {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 18px 24px 0;
                    box-sizing: border-box;
                    position: relative;
                }
                .cp-nav {
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px 0 16px;
                }
                .cp-link {
                    color: ${C.ink};
                    text-decoration: none;
                    opacity: 0.9;
                    font-size: 14px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                .cp-link:hover {
                    opacity: 1;
                }
                .cp-navlinks {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .cp-burger {
                    display: none;
                }
                .cp-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 56px 24px 72px;
                    box-sizing: border-box;
                    flex: 1;
                }
                .cp-title {
                    margin: 0;
                    font-size: clamp(2.1rem, 4vw, 3rem);
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    color: ${C.ink};
                }
                .cp-prose {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    font-size: 15.5px;
                    line-height: 1.72;
                    color: ${C.ink2};
                }
                .cp-prose h2 {
                    margin: 20px 0 2px;
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: ${C.ink};
                }
                .cp-prose h3 {
                    margin: 12px 0 0;
                    font-size: 16.5px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: ${C.ink};
                }
                .cp-prose p {
                    margin: 0;
                }
                .cp-prose ul {
                    margin: 4px 0;
                    padding-left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .cp-prose a {
                    color: ${C.accent};
                    text-decoration: none;
                    font-weight: 500;
                    word-break: break-all;
                }
                .cp-prose a:hover {
                    text-decoration: underline;
                }
                .cp-table-wrap {
                    margin: 12px 0;
                    overflow-x: auto;
                    border-radius: 16px;
                    border: 1px solid ${C.line};
                    background: rgba(255, 255, 255, 0.72);
                }
                .cp-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13.5px;
                    line-height: 1.5;
                    text-align: left;
                }
                .cp-table th {
                    background: rgba(16, 17, 20, 0.04);
                    color: ${C.ink};
                    font-weight: 700;
                    padding: 12px 14px;
                    border-bottom: 1px solid ${C.line};
                    white-space: nowrap;
                }
                .cp-table td {
                    padding: 12px 14px;
                    border-bottom: 1px solid ${C.line};
                    color: ${C.ink2};
                    vertical-align: top;
                }
                .cp-table tr:last-child td {
                    border-bottom: none;
                }
                @media (max-width: 760px) {
                    .cp-nav-wrap {
                        padding: 8px 12px 0;
                    }
                    .cp-navlinks, .cp-desktop-auth {
                        display: none !important;
                    }
                    .cp-burger {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .cp-container {
                        padding: 40px 20px 56px;
                    }
                }
            `}</style>

            {/* Üst Menü */}
            <div className="cp-nav-wrap">
                <nav className="cp-nav" aria-label="Main">
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

                    <div className="cp-navlinks">
                        <a className="cp-link" href="/#tarife">
                            Tarifeler
                        </a>
                        <a className="cp-link" href="/bizimle-calisin">
                            Bizimle Çalışın
                        </a>
                        <a className="cp-link" href="/hakkimizda">
                            Hakkımızda
                        </a>
                    </div>

                    <div className="cp-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                    <div className="cp-burger">
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

            {/* Çerez Politikası İçeriği */}
            <div className="cp-container">
                <h1 className="cp-title">Çerez Politikası</h1>
                <article className="cp-prose">
                    <h2>Giriş</h2>
                    <p>
                        İşbu Çerez Politikası (“Politika”), 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamındaki yükümlülükler uyarınca veri sorumlusu sıfatını haiz <b>PayTaksi</b> olarak tarafımızca hazırlanmıştır.
                    </p>
                    <p>
                        PayTaksi olarak <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> adresinde yer alan internet sitemizde (“İnternet Sitesi” veya “Site”) çerezler (cookies) ve yerel depolama teknolojileri (“Çerez”) kullanıyoruz.
                    </p>
                    <p>
                        Bu Çerez Politikası, KVKK, ikincil mevzuatı, Kişisel Verileri Koruma Kurumu tarafından yayımlanan Çerez Uygulamaları Hakkında Rehber ve Kişisel Verileri Koruma Kurulu kararları uyarınca; çerezler aracılığıyla kişisel verilerinizin işlenmesi, çerezlerin hangi amaçlarla kullanılması ve çerez tercihlerinin yönetilmesi hususlarında sizleri bilgilendirmeyi amaçlamaktadır.
                    </p>
                    <p>
                        Ziyaretçiler, Kesinlikle Gerekli Çerezler dışında kalan çerezler için tercihlerini her zaman tarayıcı ayarları veya Sitemizdeki tercihler üzerinden değiştirebilirler.
                    </p>

                    <h2>Çerez Nedir?</h2>
                    <p>
                        Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınıza veya cihazınıza (bilgisayar, akıllı telefon, tablet vb.) depolanan küçük boyutlu metin dosyalarıdır. Çerezler temel olarak kullanıcının ve cihazının tanınmasına, kullanıcının tercihleri ve geçmiş işlemleriyle ilgili bazı bilgilerin depolanmasına ve böylece kullanıcının çevrimiçi ziyaret deneyiminin geliştirilmesine imkân tanır.
                    </p>
                    <p>
                        Çerezler çoğunlukla kendine ait benzersiz bir tanımlayıcı numaraya (unique identifier veya cookie ID) sahiptir. Bu tanımlayıcı numara tarayıcınızın tanınmasını ve internet siteleri üzerindeki hareketlerinizden ve yaptığınız işlemlerden sizin hakkınızda çıkarımda bulunulmasını sağlar.
                    </p>
                    <p>
                        Çerezler vasıtasıyla kişisel veriler otomatik yöntemlerle (insan müdahalesi olmaksızın) elde edilir. Çerezler kullandığınız tarayıcınız ve internet sitelerinin sunucuları arasında kurulan iletişim aracılığıyla gönderilmektedir.
                    </p>

                    <h2>Çerez Türleri Nelerdir?</h2>
                    <p>
                        Çerezler genel olarak çerez sağlayıcı tarafa göre, çerezlerin kullanım sürelerine göre ve çerezlerin kullanım amacına göre farklı sınıflandırmalara tabidir.
                    </p>
                    <h3>Çerez Sağlayıcı Taraflara Göre Çerezler iki grup altında sınıflandırılmaktadır:</h3>
                    <ul>
                        <li>
                            <b>Birinci Taraf Çerezler;</b> doğrudan kullanıcının ziyaret ettiği internet sitesi, başka bir deyişle tarayıcının adres çubuğunda gösterilen URL (<a href="https://paytaksi.com.tr">paytaksi.com.tr</a>) tarafından yerleştirilen çerezlerdir. Birinci taraf çerezler aracılığıyla işlenen kişisel veriler doğrudan internet sitesini yöneten veri sorumlusu tarafından elde edilmektedir.
                        </li>
                        <li>
                            <b>Üçüncü Taraf Çerezler;</b> kullanıcının ziyaret ettiği internet sitesinden farklı bir üçüncü kişi tarafından yerleştirilen çerezlerdir.
                        </li>
                    </ul>

                    <h3>Kullanım Sürelerine Göre Çerezler ikiye ayrılmaktadır:</h3>
                    <ul>
                        <li>
                            <b>Oturum Çerezleri (session – non-persistent);</b> yalnızca kullanıcının internet sitesini ziyaret ettiği süre boyunca saklanmaktadır. Kullanıcı internet sitesini terk ettiğinde çerezlerin süresi sona ermekte, çerezler otomatik olarak silinmektedir.
                        </li>
                        <li>
                            <b>Kalıcı Çerezler (persistent);</b> belirli süreler boyunca tarayıcıda saklanmaktadır. Kalıcı çerezlerin saklama süreleri kullanım amacına göre değişiklik göstermektedir. Önceden belirlenen sürelerin dolmasının ardından bu çerezler otomatik olarak silinmektedir. Kalıcı çerezler için belirlenen sürenin sona ermesinden önce kullanıcının çerez ayarlarını değiştirmesi halinde, bu çerezler belirlenen süreden önce de silinebilecektir.
                        </li>
                    </ul>

                    <h3>Kullanım Amacına Göre Çerezler dört temel amaç altında toplanmaktadır:</h3>
                    <ul>
                        <li>
                            <b>Kesinlikle Gerekli (Zorunlu) Çerezler;</b> internet sitelerinin düzgün çalışması için kullanılması zorunlu olan çerezlerdir. Bu çerezler, internet sitelerinin farklı özelliklerinin etkinleştirilmesini sağlamakta; kullanıcının talep etmiş olduğu bir bilgi toplumu hizmetinin (giriş yapma, taksi çağırma formu doldurma, gizlilik tercihlerinin hatırlanması gibi) yerine getirilebilmesi için zorunlu olarak kullanılmaktadırlar. Kesinlikle gerekli (zorunlu) çerezlerin engellenmesi halinde, internet sitesinin bazı bölümleri çalışamayacaktır. Bu çerezler, herhangi bir şekilde pazarlama amacıyla kullanılmazlar.
                        </li>
                        <li>
                            <b>İşlevsel Çerezler;</b> kişiselleştirme ve tercihlerin hatırlanması amaçları ile kullanılan çerezlerdir. Bu çerezler zorunlu çerezler dışında kalan işlevsellikleri sağlama amacıyla kullanılmaktadır. Kullanıcıların internet sitelerindeki deneyimlerini iyileştirir ve sitelere işlevsellik katarlar.
                        </li>
                        <li>
                            <b>Performans-Analitik Çerezler;</b> kullanıcıların internet sitelerindeki hareketlerini analiz etme amacıyla istatistiki ölçüm yapılmasını sağlayan çerezlerdir. Bu doğrultuda internet sitelerinin ve hizmetlerin geliştirilmesine imkân tanırlar. Örneğin; kullanıcının cihazına ilişkin bilgiler, internet sitesinde en sık tıklanan veya en çok zaman geçirilen sayfalar gibi bilgiler, analitik/performans çerezleri aracılığıyla elde edilmektedir.
                        </li>
                        <li>
                            <b>Reklam/Pazarlama Çerezleri;</b> kullanıcıların çevrimiçi hareketlerini takip ederek kişisel ilgi alanlarını saptar ve bu ilgi alanlarına ilişkin reklam/pazarlama faaliyetleri yürütülmesine yardımcı olur.
                        </li>
                    </ul>

                    <h2>Çerezler ile Hangi Kişisel Veriler Elde Edilir?</h2>
                    <p>
                        Çerezler aracılığıyla, kullandığınız tarayıcı ve işletim sistemi, IP adresi, kullanıcı ID’niz, ziyaretinizin tarihi ve saati, etkileşim durumu (örneğin, Site’ye erişip erişemediğiniz veya bir hata uyarısı alıp almadığınız), Site’deki özelliklerin kullanımı, girdiğiniz kalkış/varış arama ifadeleri, Site’yi ne sıklıkta ziyaret ettiğiniz, dil tercihleriniz, sayfa kaydırma hareketleriniz, eriştiğiniz sekmelere ilişkin bilgiler dahil kullanıcı işlem kayıtlarına ilişkin veriler toplanmakta ve işlenmektedir.
                    </p>

                    <h2>PayTaksi Çerezleri Hangi Amaçlarla ve Hukuki Sebeplerle Kullanır?</h2>
                    <p>
                        İnternet Sitesi’nde kullandığımız çerezlere ilişkin detaylı bilgiler, çerezlerin kullanım amaçları ve hukuki sebepleriyle birlikte bu bölümde bilginize sunulmaktadır.
                    </p>

                    <h3>4.1 Kesinlikle Gerekli (Zorunlu) Çerezler</h3>
                    <p>
                        PayTaksi, İnternet Sitesi’ni düzgün bir şekilde kullanabilmeniz ve Site’nin tüm özelliklerine erişebilmeniz için kesinlikle gerekli çerezleri kullanmaktadır. Kesinlikle gerekli çerezlerin kullanılmadığı durumlarda Site’nin belirli fonksiyonlarından yararlanamayabilirsiniz; Site’nin tamamı veya bir kısmı düzgün çalışmayabilir. Örneğin; taksi çağırma, tahmini ücret hesaplama ve üye girişi işlemleri için kesinlikle gerekli çerezler kullanılmaktadır.
                    </p>
                    <p>
                        Bu çerezler aracılığıyla elde edilen kişisel verileriniz, KVKK’nın 5/2-f maddesi kapsamında “ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması” hukuki sebebi kapsamında işlenmektedir.
                    </p>

                    <h3>4.2. İşlevsellik Çerezleri</h3>
                    <p>
                        İnternet Sitesi deneyiminizi en üst seviyeye çıkarmak ve Site’ye işlevsellik katmak amacıyla işlevsellik çerezlerini kullanıyoruz. Örneğin; Site’de oturumunuzun açık kalmasını sağlayan ve Google hesabınızla tek dokunuşla giriş yapmanıza olanak tanıyan çerezler, işlevsellik çerezleridir.
                    </p>
                    <p>
                        Bu çerezler aracılığıyla elde edilen kişisel verileriniz, KVKK’nın 5/1 maddesi kapsamında açık rızanızın alınması suretiyle işlenmektedir.
                    </p>

                    <h3>4.3. Analitik/Performans Çerezleri</h3>
                    <p>
                        İnternet Sitesi'ndeki hareketlerinizi analiz etmek ve bu doğrultuda hizmetlerimizi ve kullanıcı deneyiminizi geliştirmek amacıyla analitik/performans çerezleri kullanıyoruz. Örneğin; Site’yi ziyaret eden kullanıcı sayısı, taksi çağırma adımlarındaki etkileşim oranları gibi bilgilere ulaşmak için bu çerezleri kullanıyoruz.
                    </p>
                    <p>
                        Bu çerezler aracılığıyla elde edilen kişisel verileriniz, KVKK’nın 5/1 maddesi kapsamında açık rızanızın alınması suretiyle işlenmektedir.
                    </p>

                    <h3>Tablo: İnternet Sitesi’nde kullanılan çerezler</h3>
                    <div className="cp-table-wrap">
                        <table className="cp-table">
                            <thead>
                                <tr>
                                    <th>Çerez Adı</th>
                                    <th>Çerez Sağlayıcısı</th>
                                    <th>Çerezin Kullanım Amacı</th>
                                    <th>Çerezin Süresi</th>
                                    <th>Çerez Türü</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COOKIE_ROWS.map((r) => (
                                    <tr key={r.name}>
                                        <td style={{ fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{r.name}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>{r.provider}</td>
                                        <td>{r.purpose}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>{r.duration}</td>
                                        <td>{r.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2>Çerezler Aracılığıyla Elde Edilen Kişisel Veriler Hangi Üçüncü Taraflara Aktarılır?</h2>
                    <p>
                        Çerezler aracılığıyla elde edilen kişisel verileriniz, işbu Politika’nın 4. maddesinde açıklanan amaçlarla, yurt içi ve yurt dışındaki çerez sağlayıcıları ile paylaşılabilmektedir. Kişisel verilerin paylaşıldığı üçüncü taraflar, yukarıdaki Tabloda “Çerez Sağlayıcısı” başlığı altında bilgilerinize sunulmaktadır.
                    </p>
                    <p>
                        Çerezler aracılığıyla elde edilen kişisel verileriniz, KVKK’nın 9. maddesine uygun olarak, açık rızanızın alınması suretiyle yurt dışındaki üçüncü taraflara aktarılmaktadır. Üçüncü taraf çerezlerini etkinleştirme yetkisi tamamen siz kullanıcılarımızdadır.
                    </p>

                    <h2>Çerezler Nasıl Yönetilir?</h2>
                    <p>
                        İnternet Sitesi’nde kullanılan çerezleri her zaman kontrol edebilir ve kullanımına izin verdiğiniz çerezlerin iznini her zaman geri alabilirsiniz. Çerezleri tarayıcı ayarlarınızı güncelleyerek yönetebilirsiniz. İnternet tarayıcınızın çeşidine göre aşağıdaki yardım sayfalarındaki adımları izleyerek çerezler hakkında bilgi edinip izin verme veya reddetme hakkınızı kullanabilirsiniz:
                    </p>
                    <ul>
                        <li>
                            <b>Google Chrome:</b>{" "}
                            <a href="https://support.google.com/accounts/?co=GENIE.Platform%3DDesktop&hl=tr#topic=3382296" target="_blank" rel="noreferrer">
                                https://support.google.com/accounts/?co=GENIE.Platform%3DDesktop&hl=tr#topic=3382296
                            </a>
                        </li>
                        <li>
                            <b>Safari:</b>{" "}
                            <a href="https://help.apple.com/safari/mac/9.0/#/sfri40732" target="_blank" rel="noreferrer">
                                https://help.apple.com/safari/mac/9.0/#/sfri40732
                            </a>
                        </li>
                        <li>
                            <b>Opera:</b>{" "}
                            <a href="https://help.opera.com/en/latest/web-preferences/" target="_blank" rel="noreferrer">
                                https://help.opera.com/en/latest/web-preferences/
                            </a>
                        </li>
                        <li>
                            <b>Mozilla Firefox:</b>{" "}
                            <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noreferrer">
                                https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox
                            </a>
                        </li>
                        <li>
                            <b>Microsoft Edge:</b>{" "}
                            <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noreferrer">
                                https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge
                            </a>
                        </li>
                    </ul>
                    <p>
                        Çerezleri tarayıcınızın ayarlarını kullanarak tamamen kaldırmanız halinde İnternet Sitesi’nin düzgün çalışması için zorunlu olan bazı çerezleri de engellemiş olursunuz. Bu durum Site’nin tamamının veya bir kısmının düzgün çalışmamasına neden olabilir.
                    </p>

                    <h2>Çerezler Aracılığıyla İşlenen Kişisel Verilerinize İlişkin Haklarınız</h2>
                    <p>
                        Çerezler aracılığıyla elde edilen ve işlenen kişisel verilerinize ilişkin olarak KVKK’nın 11. maddesinde sayılan haklarınızı kullanmak için talebinizi; sistemlerimizde kayıtlı e-posta adresinizi kullanarak <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a> adresine iletmenizi rica ederiz.
                    </p>
                    <p>
                        PayTaksi, KVKK’nın 13. maddesine uygun olarak, başvuru taleplerinizi, talebin niteliğine göre ve en geç 30 (otuz) gün içinde sonuçlandıracaktır. İşlemin maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarife uygulanacaktır.
                    </p>

                    <h2>Politika Hakkında</h2>
                    <p>
                        Bu Politika, İnternet Sitesi’ndeki çerez kullanımında olabilecek değişikliklere veya hukuki düzenlemelere uyum sağlamak amacıyla güncellenebilir. Politikadaki değişiklikler İnternet Sitesi üzerinden ziyaretçilerimize bildirilecektir.
                    </p>
                    <p style={{ fontWeight: 600, color: C.ink, marginTop: 8 }}>
                        Güncellenme Tarihi: Kasım 2026
                    </p>
                </article>
            </div>

            <Footer />
        </div>
    )
}
