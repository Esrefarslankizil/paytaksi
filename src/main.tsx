import * as React from "react"
import { createRoot } from "react-dom/client"
import StaysiftHero from "./StaysiftHero"
import AdminApp from "./admin/AdminApp"
import DriverApp from "./driver/DriverApp"
import AuthPage from "./auth/AuthPage"

function App() {
    const path = window.location.pathname
    if (path.startsWith("/admin")) {
        return <AdminApp />
    }
    if (path.startsWith("/surucu")) {
        return <DriverApp />
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
        <div style={{ width: "100vw", height: "100dvh", position: "relative", overflow: "hidden", background: "#F1EFEA" }}>
            <StaysiftHero showNav={true} />
        </div>
    )
}

const rootEl = document.getElementById("root")!
createRoot(rootEl).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
