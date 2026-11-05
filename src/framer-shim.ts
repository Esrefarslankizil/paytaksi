// Minimal Framer runtime shim so Framer code components run standalone in React/Vite
export const ControlType = {
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Color: "color",
    Enum: "enum",
    File: "file",
    Image: "image",
    ComponentInstance: "componentInstance",
    Array: "array",
    Object: "object",
    Date: "date",
    Link: "link",
    ResponsiveImage: "responsiveimage",
    FusedNumber: "fusednumber",
    Transition: "transition",
    BoxShadow: "boxshadow",
    Font: "font",
} as const

export function addPropertyControls(_component: any, _controls: any) {
    // No-op outside Framer canvas
}

export function useIsStaticRenderer(): boolean {
    return false
}
