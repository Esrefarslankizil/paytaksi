import * as React from "react"
import { createRoot } from "react-dom/client"
import StaysiftHero from "./StaysiftHero"

function App() {
    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#F1EFEA" }}>
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
