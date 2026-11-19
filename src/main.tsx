import * as React from "react"
import { createRoot } from "react-dom/client"
import StaysiftHero from "./StaysiftHero"
import AdminApp from "./admin/AdminApp"

function App() {
    if (window.location.pathname.startsWith("/admin")) {
        return <AdminApp />
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
