import * as React from "react"
import { createRoot } from "react-dom/client"
import StaysiftHero from "./StaysiftHero"
import AdminApp from "./admin/AdminApp"
import DriverApp from "./driver/DriverApp"
import AuthPage from "./auth/AuthPage"
import AboutPage from "./components/AboutPage"
import PartnerPage from "./components/PartnerPage"
import CookiePolicyPage from "./components/CookiePolicyPage"
import LegalPage from "./components/LegalPage"
import ServiceAreasPage from "./components/ServiceAreasPage"
import Footer from "./components/Footer"

function App() {
    const path = window.location.pathname
    if (path.startsWith("/admin")) {
        return <AdminApp />
    }
    if (path.startsWith("/surucu")) {
        return <DriverApp />
    }
    if (path.startsWith("/hakkimizda")) {
        return <AboutPage />
    }
    if (path.startsWith("/hizmet-bolgeleri")) {
        return <ServiceAreasPage />
    }
    if (path.startsWith("/bizimle-calisin")) {
        return <PartnerPage />
    }
    if (path.startsWith("/cerez")) {
        return <CookiePolicyPage />
    }
    if (path.startsWith("/kullanim-kosullari")) {
        return <LegalPage page="kullanim-kosullari" />
    }
    if (path.startsWith("/gizlilik")) {
        return <LegalPage page="gizlilik" />
    }
    if (path.startsWith("/kvkk")) {
        return <LegalPage page="kvkk" />
    }
    if (path.startsWith("/iptal-iade")) {
        return <LegalPage page="iptal-iade" />
    }
    if (path.startsWith("/mesafeli-satis")) {
        return <LegalPage page="mesafeli-satis" />
    }
    if (path.startsWith("/iletisim")) {
        return <LegalPage page="iletisim" />
    }
    if (path.startsWith("/giris")) {
        return (
            <div style={{ width: "100vw", height: "100dvh", position: "relative", overflow: "hidden", background: "#F1EFEA" }}>
                <StaysiftHero showNav={true} />
                <AuthPage initialMode="login" />
            </div>
        )
    }
    if (path.startsWith("/kayit")) {
        return (
            <div style={{ width: "100vw", height: "100dvh", position: "relative", overflow: "hidden", background: "#F1EFEA" }}>
                <StaysiftHero showNav={true} />
                <AuthPage initialMode="register" />
            </div>
        )
    }
    return (
        <div id="top" style={{ width: "100%", background: "#F1EFEA" }}>
            <div style={{ width: "100%", height: "100dvh", position: "relative", overflow: "hidden", background: "#F1EFEA" }}>
                <StaysiftHero showNav={true} />
            </div>
            <Footer />
        </div>
    )
}

const rootEl = document.getElementById("root")!
createRoot(rootEl).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
