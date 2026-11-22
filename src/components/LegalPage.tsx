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

export type LegalSlug = "kullanim-kosullari" | "gizlilik" | "kvkk" | "iptal-iade" | "mesafeli-satis" | "iletisim"

const KVKK_TABLE = [
    {
        category: "Kimlik Bilgileri",
        data: "Ad, soyad, kullanıcı/yolcu ID (müşteri tanımlayıcı numarası).",
        purpose: "Üyelik kaydının oluşturulması, yolcu ve sürücü eşleşmesinin sağlanması, sözleşme süreçlerinin yürütülmesi.",
        legalBasis: "KVKK m. 5/2-c (Sözleşmenin kurulması ve ifası), m. 5/2-ç (Hukuki yükümlülük).",
    },
    {
        category: "İletişim Bilgileri",
        data: "Cep telefonu (GSM) numarası, e-posta adresi.",
        purpose: "Taksi sürücüsünün yolcuya ulaşabilmesi, çağrı durumu bildirimleri, müşteri destek ve iade süreçlerinin yürütülmesi.",
        legalBasis: "KVKK m. 5/2-c (Sözleşmenin kurulması ve ifası), m. 5/2-f (Meşru menfaat).",
    },
    {
        category: "Lokasyon (Konum) Bilgileri",
        data: "Anlık GPS koordinatları, haritadan seçilen veya yazılan alış (kalkış) ve varış (bırakılış) adresleri.",
        purpose: "Konuma en yakın ticari taksinin yönlendirilmesi, karayolu sürüş mesafesinin (km) ve sabit/tahmini ücretin hesaplanması.",
        legalBasis: "KVKK m. 5/2-c (Sözleşmenin ifası), m. 5/1 (Cihaz GPS izni kapsamında açık rıza).",
    },
    {
        category: "Yolculuk ve İşlem Bilgileri",
        data: "Yolculuk güzergâhı, tarih, saat, süre, sabit tarife tutarı, ödeme tercihi (Nakit / Cüzdan), iptal kayıtları, talep ve şikâyetler.",
        purpose: "Ulaşım aracılık hizmetinin ifası, suistimal ve sahte çağrıların önlenmesi, hizmet kalitesinin ölçülmesi ve uyuşmazlıkların çözümü.",
        legalBasis: "KVKK m. 5/2-c (Sözleşmenin ifası), m. 5/2-e (Bir hakkın tesisi, kullanılması veya korunması), m. 5/2-f (Meşru menfaat).",
    },
    {
        category: "Finansal ve Ödeme Bilgileri",
        data: "Cüzdan bakiye yükleme tutarı, işlem tarihi/saati, PayTR işlem referans numarası, indirim (%15) kullanım bilgisi (Kredi kartı numarası ve CVV kesinlikle saklanmaz).",
        purpose: "Ödeme ve bakiye yükleme işlemlerinin 6493 sayılı Kanun kapsamında BDDK lisanslı ödeme kuruluşu (PayTR) üzerinden gerçekleştirilmesi ve iade süreçlerinin yürütülmesi.",
        legalBasis: "KVKK m. 5/2-a (Kanunlarda açıkça öngörülmesi), m. 5/2-c (Sözleşmenin ifası), m. 5/2-ç (Hukuki yükümlülük).",
    },
    {
        category: "İşlem Güvenliği Bilgileri",
        data: "IP adresi, tarayıcı/cihaz bilgisi, oturum jetonu (JWT), trafik ve erişim log kayıtları.",
        purpose: "5651 sayılı Kanun kapsamındaki trafik kaydı yükümlülüklerinin yerine getirilmesi, bilgi güvenliği ve yetkisiz erişimlerin engellenmesi.",
        legalBasis: "KVKK m. 5/2-a (Kanunlarda açıkça öngörülmesi – 5651 sayılı Kanun), m. 5/2-f (Meşru menfaat).",
    },
]

export default function LegalPage({ page }: { page: LegalSlug }) {
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
    }, [page])

    const userInitial = authUser
        ? (authUser.fullName || authUser.email || "U").trim().charAt(0).toLocaleUpperCase("tr-TR")
        : ""

    const renderContent = () => {
        switch (page) {
            case "kullanim-kosullari":
                return (
                    <>
                        <h1 className="lp-title">Kullanım Koşulları ve Kullanıcı Sözleşmesi</h1>
                        <article className="lp-prose">
                            <h2>1. Taraflar, Konu ve Yasal Dayanak</h2>
                            <p>
                                <b>1.1.</b> İşbu Kullanım Koşulları ve Kullanıcı Sözleşmesi (“Sözleşme”), <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> alan adlı internet sitesi ve mobil web arayüzü (“Platform” veya “Site”) üzerinden faaliyet gösteren <b>PayTaksi Dijital Ulaşım Platformu</b> (“PayTaksi”) ile Platform’a üye olan veya üye olmaksızın hizmetlerden yararlanan gerçek kişi (“Kullanıcı” veya “Yolcu”) arasında, Kullanıcının elektronik ortamda onay vermesi veya Site’yi kullanmaya başlamasıyla birlikte yürürlüğe girmiştir.
                            </p>
                            <p>
                                <b>1.2.</b> İşbu Sözleşme; <b>6098 sayılı Türk Borçlar Kanunu</b>, <b>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</b>, <b>6502 sayılı Tüketicinin Korunması Hakkında Kanun</b>, <b>5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun</b> ve <b>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)</b> hükümlerine uygun olarak hazırlanmıştır.
                            </p>

                            <h2>2. Tanımlar</h2>
                            <ul>
                                <li><b>Platform (Site):</b> PayTaksi tarafından işletilen <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> alan adlı web sitesi ve bağlı dijital servisleri.</li>
                                <li><b>Yolcu (Kullanıcı):</b> Platform üzerinden alış ve varış noktası belirleyerek ticari taksi çağıran ve/veya cüzdan bakiyesi yükleyen gerçek kişi.</li>
                                <li><b>Sürücü (Kaptan):</b> Elazığ il sınırları içerisinde ilgili belediye ve meslek odası mevzuatına uygun resmi ticari taksi plakası (23 T) ve sürücü belgesi ile yolcu taşımacılığı yapan bağımsız taşımacı.</li>
                                <li><b>Cüzdan / Bakiye:</b> Yolcunun <b>6493 sayılı Kanun</b> kapsamında Türkiye Cumhuriyet Merkez Bankası (TCMB) ve BDDK lisanslı ödeme kuruluşu <b>PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.</b> altyapısı aracılığıyla hesabına yüklediği ve yolculuk ödemelerinde %15 indirim avantajıyla kullandığı dijital bakiye.</li>
                            </ul>

                            <h2>3. PayTaksi’nin Hukuki Statüsü (Aracı Hizmet Sağlayıcı)</h2>
                            <p>
                                <b>3.1.</b> PayTaksi, <b>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</b> ve <b>Elektronik Ticarette Hizmet Sağlayıcı ve Aracı Hizmet Sağlayıcılar Hakkında Yönetmelik</b> kapsamında <b>“Aracı Hizmet Sağlayıcı”</b> ve teknoloji platformu statüsündedir.
                            </p>
                            <p>
                                <b>3.2.</b> PayTaksi bizzat ticari taksi işletmeciliği veya doğrudan yolcu taşımacılığı yapmamakta; yalnızca taksi ihtiyacı bulunan Yolcu ile bağımsız Sürücüyü dijital ortamda eşleştiren teknolojik altyapıyı sunmaktadır. Taşıma hizmeti, doğrudan ilgili ticari taksi Sürücüsü tarafından ilgili karayolu taşıma ve belediye mevzuatı çerçevesinde sunulur.
                            </p>

                            <h2>4. Üyelik, Kullanım Şartları ve Çağrı Kuralları</h2>
                            <ul>
                                <li><b>4.1. Üyelik:</b> Kullanıcı, Google OAuth 2.0 kimlik doğrulama servisi veya e-posta ve şifre bilgileriyle ücretsiz üye olabilir. Çağrı eşleşmesinin tamamlanabilmesi ve Sürücünün Yolcuya ulaşabilmesi için geçerli bir Türkiye GSM numarasının (`05XX XXX XX XX`) hesaba tanımlanması zorunludur.</li>
                                <li><b>4.2. Yanıltıcı/Sahte Çağrı Önleme Politikası:</b> Sürücülerin zaman ve yakıt kaybına uğramasını önlemek amacıyla, üye girişi yapmadan (misafir olarak) araçta nakit ödeme seçeneğiyle oluşturulan çağrılarda ardışık çağrılar arasında <b>60 (altmış) dakikalık</b> güvenlik bekleme süresi uygulanır. Üye girişi yapan ve cüzdan bakiyesi kullanan doğrulamış kullanıcılar bu kısıtlamaya tabi olmaksızın kesintisiz çağrı oluşturabilir.</li>
                                <li><b>4.3. Yolcu Sorumlulukları:</b> Yolcu; belirttiği alış noktasında zamanında hazır bulunmayı, Sürücüye ve araca zarar verecek veya Karayolları Trafik Kanunu’na aykırı davranışlardan kaçınmayı, nakit seçilen yolculuklarda yolculuk bedelini Sürücüye eksiksiz ödemeyi kabul ve taahhüt eder.</li>
                            </ul>

                            <h2>5. Ücretlendirme, Sabit Tarife ve Ödeme Altyapısı</h2>
                            <p>
                                <b>5.1.</b> Platform üzerinde gösterilen yolculuk ücretleri; Elazığ güncel taksi tarifesi (İndi-Bindi kısa mesafe taban ücreti `250 TL`, taksimetre açılış ücreti `50 TL` ve kilometre başı `45 TL/km` birim ücreti) esas alınarak seçilen alış ve varış noktaları arasındaki gerçek karayolu sürüş mesafesi üzerinden otomatik hesaplanır ve çağrı onayı öncesinde şeffaf şekilde Türk Lirası (`TL`) cinsinden gösterilir.
                            </p>
                            <p>
                                <b>5.2.</b> Üye girişi yaparak cüzdan bakiyesi ile ödeme yapan kullanıcılara standart sabit ücret üzerinden anında <b>%15 indirim</b> uygulanır.
                            </p>
                            <p>
                                <b>5.3.</b> Kartlı bakiye yükleme işlemleri, <b>6493 sayılı Ödeme ve Menkul Kıymet Mutabakat Sistemleri, Ödeme Hizmetleri ve Elektronik Para Kuruluşları Hakkında Kanun</b> uyarınca faaliyet gösteren <b>PayTR</b> güvenli sanal POS altyapısı ve 3D Secure doğrulaması ile gerçekleştirilir. PayTaksi hiçbir koşulda kredi/banka kartı numarası veya CVV bilgisi saklamaz.
                            </p>

                            <h2>6. Fikri Mülkiyet Hakları</h2>
                            <p>
                                Platform’da yer alan 3D interaktif harita arayüzü, yazılım kodları, “PayTaksi” markası, logolar, tasarımlar ve metinler <b>5846 sayılı Fikir ve Sanat Eserleri Kanunu</b> ve <b>6769 sayılı Sınai Mülkiyet Kanunu</b> kapsamında korunmaktadır; yazılı izin olmaksızın kopyalanamaz, çoğaltılamaz ve tersine mühendislik işlemine tabi tutulamaz.
                            </p>

                            <h2>7. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
                            <p>
                                İşbu Sözleşme’nin uygulanmasından ve yorumlanmasından doğacak uyuşmazlıklarda Türkiye Cumhuriyeti Hukuku uygulanır; uyuşmazlıkların çözümünde <b>Elazığ Mahkemeleri, İcra Daireleri ve Elazığ Tüketici Hakem Heyetleri</b> yetkilidir.
                            </p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Güncellenme Tarihi: Kasım 2026</p>
                        </article>
                    </>
                )

            case "gizlilik":
                return (
                    <>
                        <h1 className="lp-title">Gizlilik ve Güvenlik Politikası</h1>
                        <article className="lp-prose">
                            <h2>1. Amaç ve Yasal Çerçeve</h2>
                            <p>
                                İşbu Gizlilik ve Güvenlik Politikası (“Politika”), <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> (“Site”) üzerinden sunulan dijital taksi çağırma ve cüzdan bakiye hizmetleri sırasında kullanıcılarımızın gizliliğinin korunması, bilgi güvenliği standartlarımız ve ödeme güvenliği esasları hakkında kullanıcılarımızı bilgilendirmek amacıyla; <b>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)</b>, <b>5651 sayılı Kanun</b>, <b>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun</b> ve <b>6493 sayılı Kanun</b> hükümlerine uyumlu olarak hazırlanmıştır.
                            </p>

                            <h2>2. İşlenen Veriler ve Gizlilik Esasları</h2>
                            <ul>
                                <li><b>Hesap ve Kimlik Verileri:</b> Kayıt veya Google ile Giriş (OAuth 2.0) sırasında alınan ad, soyad, e-posta adresi ve doğrulanmış cep telefonu numarası.</li>
                                <li><b>Konum (Lokasyon) Verileri:</b> Yalnızca kullanıcının aktif olarak taksi çağırma işlemi sırasında harita üzerinden işaretlediği, metin olarak girdiği veya tarayıcı GPS izniyle onayladığı alış ve varış koordinatları işlenir. Uygulama kapalıyken arka planda izinsiz konum takibi yapılmaz.</li>
                                <li><b>Sürücü ile Sınırlı Paylaşım İlkesi:</b> Yolcunun adı, telefon numarası ve alış/varış noktası, yalnızca ilgili çağrıyı kabul eden nöbetçi resmi ticari taksi sürücüsüne (`23 T` plakalı) yolculuğun gerçekleştirilmesi amacıyla iletilir.</li>
                            </ul>

                            <h2>3. Ödeme ve Kredi Kartı Güvenliği (PCI-DSS & 256-Bit SSL)</h2>
                            <p>
                                <b>3.1.</b> Site üzerindeki tüm veri iletişimi <b>256-bit SSL (Secure Sockets Layer / TLS 1.3)</b> şifreleme protokolü ile korunmaktadır.
                            </p>
                            <p>
                                <b>3.2.</b> Cüzdan bakiye yükleme işlemlerinde kullanılan kredi kartı ve banka kartı bilgileri, <b>PayTaksi sunucularından geçmez ve hiçbir veritabanımızda kaydedilmez</b>. Ödeme işlemleri doğrudan TCMB ve BDDK denetimindeki <b>PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.</b>’nin <b>PCI-DSS (Payment Card Industry Data Security Standard) Level 1</b> sertifikalı güvenli ödeme sayfasında ve bankanızın <b>3D Secure (SMS doğrulama)</b> ekranında gerçekleşir.
                            </p>

                            <h2>4. Veri Güvenliği Tedbirleri ve Saklama Süreleri</h2>
                            <p>
                                PayTaksi, KVKK’nın 12. maddesi uyarınca kişisel verilerin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek amacıyla şifreli parola özütleri (ASP.NET Core Identity PBKDF2/HMAC), JWT (JSON Web Token) tabanlı yetkilendirme, güvenlik duvarı ve erişim loglaması tedbirlerini uygular. Veriler, ilgili mevzuatta öngörülen yasal zamanaşımı süreleri boyunca saklanır; kullanıcının profil ekranından <b>“Hesabı sil”</b> talebinde bulunması halinde kullanıcı hesabı derhal silinir.
                            </p>

                            <h2>5. İletişim</h2>
                            <p>
                                Gizlilik ve veri güvenliği uygulamalarımıza ilişkin her türlü soru ve başvurunuzu <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a> adresine iletebilirsiniz.
                            </p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Güncellenme Tarihi: Kasım 2026</p>
                        </article>
                    </>
                )

            case "kvkk":
                return (
                    <>
                        <h1 className="lp-title">Kişisel Verilerin Korunması Kanunu (KVKK) Kapsamında Aydınlatma Metni</h1>
                        <article className="lp-prose">
                            <h2>1. Veri Sorumlusunun Kimliği</h2>
                            <p>
                                İşbu Aydınlatma Metni, <b>6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi</b> ile <b>Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ</b> kapsamında, veri sorumlusu sıfatıyla <b>PayTaksi Dijital Ulaşım Platformu – Eşref KIZILARSLAN</b> (<a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> · Merkez / Elazığ · Tel: 0501 136 68 15) tarafından yolcularımızın, ziyaretçilerimizin ve sürücü adaylarımızın kişisel verilerinin işlenmesine ilişkin usul ve esasları açıklamak amacıyla hazırlanmıştır.
                            </p>

                            <h2>2. İşlenen Kişisel Veri Kategorileri, Amaçları ve Hukuki Sebepleri</h2>
                            <p>
                                Platformumuzu ziyaretiniz, üyelik oluşturmanız, bakiye yüklemeniz ve taksi çağırma hizmetinden yararlanmanız kapsamında işlenen kişisel veri kategorileri, işlenme amaçları ve KVKK’nın 5. maddesine dayanan hukuki sebepleri aşağıdaki tabloda detaylı olarak sunulmuştur:
                            </p>

                            <div className="lp-table-wrap">
                                <table className="lp-table">
                                    <thead>
                                        <tr>
                                            <th>Veri Kategorisi</th>
                                            <th>İşlenen Kişisel Veriler</th>
                                            <th>İşlenme Amacı</th>
                                            <th>Hukuki Sebep (KVKK m. 5)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {KVKK_TABLE.map((row) => (
                                            <tr key={row.category}>
                                                <td style={{ fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{row.category}</td>
                                                <td>{row.data}</td>
                                                <td>{row.purpose}</td>
                                                <td>{row.legalBasis}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h2>3. Kişisel Verilerin Toplanma Yöntemi</h2>
                            <p>
                                Kişisel verileriniz; <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> internet sitesi üzerindeki üyelik, giriş, taksi çağırma ve sürücü başvuru formları, Google Identity Services (OAuth 2.0) entegrasyonu, interaktif harita konum seçici ve çerezler aracılığıyla tamamen veya kısmen otomatik elektronik yöntemlerle toplanmaktadır.
                            </p>

                            <h2>4. Kişisel Verilerin Aktarılması (KVKK m. 8 ve m. 9)</h2>
                            <p>
                                Kişisel verileriniz, KVKK’nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartlarına uygun olarak yalnızca aşağıdaki alıcı gruplarına aktarılabilmektedir:
                            </p>
                            <ul>
                                <li><b>Taksi Sürücüleri:</b> Taksi çağırma talebinizin karşılanması ve sürücünün alış noktasına gelip sizinle iletişime geçebilmesi amacıyla adınız, telefon numaranız ve alış/varış konumunuz yalnızca çağrıyı üstlenen sürücüye iletilir.</li>
                                <li><b>Lisanslı Ödeme Kuruluşu (PayTR):</b> Bakiye yükleme ve iade işlemlerinin 6493 sayılı Kanun uyarınca gerçekleştirilmesi amacıyla işlem tutarı ve kullanıcı iletişim bilgisi PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. ile paylaşılır.</li>
                                <li><b>Yetkili Kamu Kurum ve Kuruluşları:</b> 5651 sayılı Kanun ve ilgili mevzuat uyarınca mahkemeler, savcılıklar veya kolluk kuvvetleri tarafından usulüne uygun talep edilmesi halinde yasal yükümlülüğümüz (KVKK m. 5/2-ç) gereği yetkili mercilere aktarılır.</li>
                            </ul>

                            <h2>5. İlgili Kişinin KVKK Madde 11 Kapsamındaki Hakları</h2>
                            <p>
                                KVKK’nın 11. maddesi uyarınca veri sahibi (ilgili kişi) olarak;
                            </p>
                            <ul>
                                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,</li>
                                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                                <li>KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme ve yapılan işlemlerin aktarıldığı üçüncü kişilere bildirilmesini talep etme,</li>
                                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                            </ul>
                            <p>
                                haklarına sahipsiniz.
                            </p>

                            <h2>6. Başvuru Yöntemi (KVKK m. 13)</h2>
                            <p>
                                Yukarıda belirtilen haklarınıza ilişkin taleplerinizi, <b>Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ</b>’in 5. maddesi uyarınca sistemimizde kayıtlı e-posta adresiniz üzerinden <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a> adresine yazılı olarak iletebilirsiniz. Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç <b>30 (otuz) gün</b> içinde ücretsiz olarak sonuçlandırılacaktır.
                            </p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Güncellenme Tarihi: Kasım 2026</p>
                        </article>
                    </>
                )

            case "iptal-iade":
                return (
                    <>
                        <h1 className="lp-title">İptal ve İade Politikası</h1>
                        <article className="lp-prose">
                            <h2>1. Yasal Dayanak ve Kapsam</h2>
                            <p>
                                İşbu İptal ve İade Politikası; <b>6502 sayılı Tüketicinin Korunması Hakkında Kanun’un 48. maddesi</b> ve <b>29188 sayılı Resmî Gazete’de yayımlanan Mesafeli Sözleşmeler Yönetmeliği</b> hükümleri uyarınca, <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> üzerinden oluşturulan taksi çağrılarının iptali ile PayTR sanal POS altyapısı üzerinden yüklenen dijital cüzdan bakiyelerinin iade usul ve esaslarını düzenlemektedir.
                            </p>

                            <h2>2. Taksi Çağrısının İptali Koşulları</h2>
                            <ul>
                                <li><b>2.1. Yolcu Tarafından İptal:</b> Yolcu, yönlendirilen taksi alış noktasına ulaşmadan önce çağrısını hiçbir kesinti veya cezai şart olmaksızın ücretsiz olarak iptal edebilir.</li>
                                <li><b>2.2. Sürücü Kaynaklı İptal veya Gecikme:</b> Sürücünün makul sürede alış noktasına ulaşamaması, arıza veya mücbir sebeple yolculuğun başlamaması halinde çağrı iptal edilir ve kullanıcının cüzdan bakiyesinden hiçbir tahsilat yapılmaz.</li>
                            </ul>

                            <h2>3. Cüzdan Bakiyesi İadesi ve Cayma Hakkı (14 Gün)</h2>
                            <ul>
                                <li><b>3.1. 14 Günlük Kesintisiz Cayma Hakkı:</b> Mesafeli Sözleşmeler Yönetmeliği’nin 9. maddesi uyarınca Alıcı (Kullanıcı), kredi kartı veya banka kartı ile hesabına yüklediği ve <b>henüz herhangi bir yolculukta harcamadığı</b> dijital bakiyeyi, yükleme tarihinden itibaren <b>14 (ondört) gün</b> içerisinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin iade alma hakkına sahiptir.</li>
                                <li><b>3.2. Kısmi Kullanım Durumunda İade:</b> Yüklenen bakiyenin bir kısmı ile yolculuk yapılmış olması halinde, kullanılan yolculuk tutarı düşüldükten sonra kalan kullanılmamış bakiye tutarının tamamı kullanıcının talebi üzerine iade edilir.</li>
                                <li><b>3.3. Tamamlanmış Yolculuklar:</b> Mesafeli Sözleşmeler Yönetmeliği’nin 15/1-ğ maddesi uyarınca, fiilen tamamlanmış ve ifa edilmiş ulaşım hizmetlerine ilişkin bedeller (hizmet kusuru veya fazla tahsilat halleri saklı kalmak kaydıyla) cayma hakkı kapsamı dışındadır. Hatalı veya mükerrer tahsilat tespit edilmesi halinde ise süre sınırı olmaksızın derhal tam iade yapılır.</li>
                            </ul>

                            <h2>4. İade Başvurusu ve Karta Geri Ödeme Süresi</h2>
                            <p>
                                <b>4.1. Başvuru:</b> İade talepleri; işlem yapılan hesap e-posta adresi, telefon numarası ve işlem tarihi belirtilerek <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a> adresine iletilir.
                            </p>
                            <p>
                                <b>4.2. Geri Ödeme Süreci:</b> İade talebi PayTaksi tarafından incelenerek <b>en geç 3 (üç) iş günü</b> içerisinde onaylanır ve <b>PayTR</b> ödeme ağ geçidi üzerinden işlemin gerçekleştirildiği kredi veya banka kartına iade talimatı verilir.
                            </p>
                            <p>
                                <b>4.3. Banka Yansıma Süresi:</b> PayTR üzerinden bankaya iletilen iade tutarının kart ekstresine veya vadesiz hesaba yansıması, kartı veren bankanın iç operasyon süreçlerine bağlı olarak banka kartlarında ortalama <b>1–3 iş günü</b>, kredi kartlarında ise <b>2–7 iş günü</b> içerisinde gerçekleşmektedir.
                            </p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Güncellenme Tarihi: Kasım 2026</p>
                        </article>
                    </>
                )

            case "mesafeli-satis":
                return (
                    <>
                        <h1 className="lp-title">Mesafeli Hizmet Satış Sözleşmesi ve Ön Bilgilendirme Formu</h1>
                        <article className="lp-prose">
                            <h2>Madde 1 – Taraflar</h2>
                            <p>
                                <b>1.1. Hizmet Sağlayıcı / Aracı Platform Bilgileri:</b><br />
                                <b>Unvan / Platform Adı:</b> PayTaksi Dijital Ulaşım Platformu (Yetkili / İşletmeci: Eşref KIZILARSLAN)<br />
                                <b>İnternet Sitesi:</b> <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a><br />
                                <b>Adres:</b> Cumhuriyet Mah. Malatya Cad. Merkez / Elazığ (23040)<br />
                                <b>Telefon:</b> <a href="tel:+905011366815">0501 136 68 15</a><br />
                                <b>E-posta:</b> <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a>
                            </p>
                            <p>
                                <b>1.2. Alıcı (Kullanıcı / Tüketici):</b><br />
                                <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> internet sitesine üye olarak kendi adına dijital ulaşım bakiyesi yükleyen veya taksi çağırma hizmetinden yararlanan, kimlik ve iletişim bilgileri üye kayıt ekranında yer alan gerçek kişi.
                            </p>

                            <h2>Madde 2 – Sözleşmenin Konusu ve Yasal Dayanak</h2>
                            <p>
                                İşbu Mesafeli Hizmet Satış Sözleşmesi ve Ön Bilgilendirme Formu’nun (“Sözleşme”) konusu; Alıcı’nın Hizmet Sağlayıcı’ya ait <a href="https://paytaksi.com.tr">www.paytaksi.com.tr</a> internet sitesi üzerinden elektronik ortamda siparişini verdiği <b>Dijital Ulaşım Cüzdan Bakiyesi Yükleme ve Taksi Yönlendirme Hizmeti</b>’nin nitelikleri, vergiler dahil toplam fiyatı, ödeme, ifa ve cayma/iade koşulları ile ilgili olarak <b>6502 sayılı Tüketicinin Korunması Hakkında Kanun’un 48. maddesi</b> ve <b>29188 sayılı Mesafeli Sözleşmeler Yönetmeliği</b> hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
                            </p>

                            <h2>Madde 3 – Sözleşme Konusu Hizmetin Temel Nitelikleri ve Bedeli</h2>
                            <ul>
                                <li><b>3.1. Hizmet Tanımı:</b> Elazığ il sınırları içerisinde gerçekleştirilecek ticari taksi yolculuklarında kullanılmak üzere kullanıcı hesabına tanımlanan %15 indirim avantajlı dijital cüzdan bakiyesi (`170 TL`, `250 TL`, `500 TL`, `1000 TL` veya rota bazlı hesaplanan tutar).</li>
                                <li><b>3.2. Tarife ve Fiyatlandırma Esasları:</b> Platformda yolculuk ücretleri güncel Elazığ taksi tarifesi (İndi-Bindi `250 TL`, Açılış `50 TL`, Km başı `45 TL/km`) üzerinden karayolu mesafesine göre hesaplanır; üye bakiyesiyle ödemede `%15` indirim uygulanır. Ekranda belirtilen tutarlar Türk Lirası (`TL`) cinsindendir ve tüm vergiler dahildir; kullanıcıdan ek komisyon veya gizli ücret talep edilmez.</li>
                                <li><b>3.3. Ödeme Yöntemi:</b> 6493 sayılı Kanun kapsamında lisanslı ödeme kuruluşu <b>PayTR</b> 3D Secure Sanal POS altyapısı üzerinden Kredi Kartı / Banka Kartı ile peşin çekim.</li>
                            </ul>

                            <h2>Madde 4 – Hizmetin İfası ve Teslimat Şekli</h2>
                            <p>
                                <b>4.1.</b> Satın alınan dijital bakiye, fiziksel sevkiyat gerektirmeyen elektronik bir hizmettir. Alıcı’nın PayTR 3D Secure ekranında ödemeyi onaylamasının hemen ardından bakiye <b>anında (saniyeler içinde)</b> Alıcı’nın PayTaksi kullanıcı hesabına elektronik olarak tanımlanır.
                            </p>
                            <p>
                                <b>4.2.</b> Hizmetin herhangi bir teknik aksaklık nedeniyle ifa edilememesi halinde Alıcı derhal bilgilendirilir ve tahsil edilen tutar en geç 3 (üç) iş günü içinde ödeme yapılan karta kesintisiz iade edilir.
                            </p>

                            <h2>Madde 5 – Cayma Hakkı ve İade Koşulları (Yönetmelik m. 9 ve m. 12)</h2>
                            <p>
                                <b>5.1.</b> Alıcı, hesabına yüklediği ve <b>henüz yolculukta kullanmadığı</b> dijital bakiyeye ilişkin olarak, yükleme tarihinden itibaren <b>14 (ondört) gün</b> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanarak tam iade talep edebilir.
                            </p>
                            <p>
                                <b>5.2.</b> Cayma hakkının kullanılması için <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a> adresine e-posta gönderilmesi yeterlidir. Cayma bildiriminin ulaşmasını takip eden en geç 3 (üç) iş günü içerisinde tutar PayTR aracılığıyla Alıcı’nın ödeme yaptığı karta iade edilir.
                            </p>

                            <h2>Madde 6 – Uyuşmazlıkların Çözümü ve Yetkili Merciler</h2>
                            <p>
                                İşbu Sözleşme’den kaynaklanan uyuşmazlıklarda, Ticaret Bakanlığı tarafından her yıl ilan edilen parasal sınırlar dahilinde Alıcı’nın yerleşim yerindeki veya hizmetin ifa edildiği yerdeki <b>Elazığ İl/İlçe Tüketici Hakem Heyetleri</b>, bu sınırları aşan uyuşmazlıklarda ise <b>Elazığ Tüketici Mahkemeleri</b> yetkilidir.
                            </p>

                            <h2>Madde 7 – Yürürlük</h2>
                            <p>
                                Alıcı, bakiye yükleme ekranındaki onay kutucuğunu işaretleyip ödemeyi gerçekleştirdiğinde işbu Ön Bilgilendirme Formu ve Mesafeli Hizmet Satış Sözleşmesi’nin tüm koşullarını okuduğunu, anladığını ve elektronik ortamda onayladığını kabul ve beyan eder.
                            </p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Güncellenme Tarihi: Kasım 2026</p>
                        </article>
                    </>
                )

            case "iletisim":
                return (
                    <>
                        <h1 className="lp-title">İletişim</h1>
                        <article className="lp-prose">
                            <p>
                                PayTaksi ile ilgili her türlü soru, öneri, KVKK başvurusu, bakiye iade talebi ve sürücü ortaklığı başvurusu için aşağıdaki resmi iletişim kanallarımızdan bize 7/24 ulaşabilirsiniz.
                            </p>

                            <div className="lp-contact-grid">
                                <div className="lp-contact-card">
                                    <div className="lp-contact-label">PLATFORM & YETKİLİ İŞLETMECİ</div>
                                    <div className="lp-contact-val">PayTaksi Dijital Ulaşım Platformu</div>
                                    <div className="lp-contact-sub">Yetkili: Eşref KIZILARSLAN · www.paytaksi.com.tr</div>
                                </div>

                                <div className="lp-contact-card">
                                    <div className="lp-contact-label">TELEFON & MÜŞTERİ DESTEK HATTI</div>
                                    <div className="lp-contact-val">
                                        <a href="tel:+905011366815">0501 136 68 15</a>
                                    </div>
                                    <div className="lp-contact-sub">7/24 Çağrı Merkezi, İade ve WhatsApp Destek Hattı</div>
                                </div>

                                <div className="lp-contact-card">
                                    <div className="lp-contact-label">MERKEZ ADRES</div>
                                    <div className="lp-contact-val">Cumhuriyet Mah. Malatya Cad. Merkez / Elazığ</div>
                                    <div className="lp-contact-sub">Elazığ, Türkiye (Posta Kodu: 23040)</div>
                                </div>

                                <div className="lp-contact-card">
                                    <div className="lp-contact-label">KURUMSAL E-POSTA & İADE DESTEK</div>
                                    <div className="lp-contact-val">
                                        <a href="mailto:destek@paytaksi.com.tr">destek@paytaksi.com.tr</a>
                                    </div>
                                    <div className="lp-contact-sub">7/24 Yolcu, Sürücü, KVKK ve İade Desteği</div>
                                </div>
                            </div>
                        </article>
                    </>
                )
        }
    }

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
                .lp-nav-wrap {
                    width: 100%;
                    max-width: 1240px;
                    margin: 0 auto;
                    padding: 18px 24px 0;
                    box-sizing: border-box;
                    position: relative;
                }
                .lp-nav {
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px 0 16px;
                }
                .lp-link {
                    color: ${C.ink};
                    text-decoration: none;
                    opacity: 0.9;
                    font-size: 14px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                .lp-link:hover {
                    opacity: 1;
                }
                .lp-navlinks {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .lp-burger {
                    display: none;
                }
                .lp-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 56px 24px 72px;
                    box-sizing: border-box;
                    flex: 1;
                }
                .lp-title {
                    margin: 0;
                    font-size: clamp(2rem, 3.8vw, 2.8rem);
                    font-weight: 800;
                    line-height: 1.12;
                    letter-spacing: -0.03em;
                    color: ${C.ink};
                }
                .lp-prose {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    font-size: 15.5px;
                    line-height: 1.72;
                    color: ${C.ink2};
                }
                .lp-prose h2 {
                    margin: 20px 0 2px;
                    font-size: 19.5px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: ${C.ink};
                }
                .lp-prose p {
                    margin: 0;
                }
                .lp-prose ul {
                    margin: 4px 0;
                    padding-left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .lp-prose a {
                    color: ${C.accent};
                    text-decoration: none;
                    font-weight: 600;
                }
                .lp-prose a:hover {
                    text-decoration: underline;
                }
                .lp-table-wrap {
                    margin: 12px 0;
                    overflow-x: auto;
                    border-radius: 16px;
                    border: 1px solid ${C.line};
                    background: rgba(255, 255, 255, 0.72);
                }
                .lp-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13.5px;
                    line-height: 1.5;
                    text-align: left;
                }
                .lp-table th {
                    background: rgba(16, 17, 20, 0.04);
                    color: ${C.ink};
                    font-weight: 700;
                    padding: 12px 14px;
                    border-bottom: 1px solid ${C.line};
                    white-space: nowrap;
                }
                .lp-table td {
                    padding: 12px 14px;
                    border-bottom: 1px solid ${C.line};
                    color: ${C.ink2};
                    vertical-align: top;
                }
                .lp-table tr:last-child td {
                    border-bottom: none;
                }
                .lp-contact-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                    margin-top: 12px;
                }
                .lp-contact-card {
                    padding: 20px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.78);
                    border: 1px solid rgba(255, 255, 255, 0.92);
                    box-shadow: 0 16px 36px -20px rgba(16, 17, 24, 0.16), 0 0 0 1px rgba(16, 17, 20, 0.06);
                }
                .lp-contact-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: #6B6D75;
                }
                .lp-contact-val {
                    font-size: 16px;
                    font-weight: 700;
                    color: ${C.ink};
                    margin-top: 6px;
                }
                .lp-contact-sub {
                    font-size: 13px;
                    color: ${C.ink2};
                    margin-top: 3px;
                }
                @media (max-width: 760px) {
                    .lp-nav-wrap {
                        padding: 8px 12px 0;
                    }
                    .lp-navlinks, .lp-desktop-auth {
                        display: none !important;
                    }
                    .lp-burger {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .lp-container {
                        padding: 40px 20px 56px;
                    }
                    .lp-contact-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Üst Menü */}
            <div className="lp-nav-wrap">
                <nav className="lp-nav" aria-label="Main">
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

                    <div className="lp-navlinks">
                        <a className="lp-link" href="/#tarife">
                            Tarifeler
                        </a>
                        <a className="lp-link" href="/bizimle-calisin">
                            Bizimle Çalışın
                        </a>
                        <a className="lp-link" href="/hakkimizda">
                            Hakkımızda
                        </a>
                    </div>

                    <div className="lp-desktop-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                    <div className="lp-burger">
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
                    </div>
                )}
            </div>

            <div className="lp-container">{renderContent()}</div>

            <Footer />
        </div>
    )
}
