// Staysift · hero — a live scale model of a coast with bookable price pins.
// three.js scene (terrain, water, model houses, trees, tilt-shift) + crisp HTML product UI on top.
// Deterministic: everything is a pure function of time t. window.__staysift.hero.render(t, mx, my).
import * as React from "react"
import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as THREE from "https://esm.sh/three@0.169.0"

// ---------- palette ----------
const C = {
    bg: "#F1EFEA",
    ink: "#101114",
    ink2: "#55575E",
    line: "rgba(16,17,20,0.09)",
    accent: "#3A3AF4",
    glass: "rgba(252,251,248,0.74)",
}
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SANS = "'Inter Tight', 'Inter', system-ui, sans-serif"

// ---------- data (Elazığ taksi noktaları ve rotaları) ----------
const HDATA: any = {
    places: [
        {
            slug: "costa-alva",
            name: "Elysium Park AVM",
            kind: "Alışveriş & Yaşam",
            homes: 28,
            avg: 200,
            x: -2.05,
            z: 0.55,
            photo: "/places/elysium.webp",
            tags: "AVM, Merkez, Hızlı Taksi",
        },
        {
            slug: "val-serra",
            name: "Harput Kalesi & Oteller",
            kind: "Tarihi Merkez & Hilton",
            homes: 14,
            avg: 280,
            x: 2.05,
            z: -1.75,
            photo: "/places/hilton.avif",
            tags: "Hilton Otel, Seyir, Harput",
        },
        {
            slug: "lago-mino",
            name: "Hazar Gölü",
            kind: "Göl Kıyısı & Plaj",
            homes: 12,
            avg: 650,
            x: 0.75,
            z: 1.9,
            photo: "photo-1760365576591-d1e50d085c22",
            tags: "Göl, Sivrice, Sahil",
        },
        {
            slug: "porto-lume",
            name: "Çarşı · Gazi Cd.",
            kind: "Şehir Merkezi",
            homes: 45,
            avg: 150,
            x: -1.2,
            z: -1.2,
            photo: "/places/elysium.webp",
            tags: "Çarşı, Merkez, Durak",
        },
        {
            slug: "campo-vento",
            name: "Fethi Sekin Şehir Hastanesi",
            kind: "Kampüs & Şehir Hastanesi",
            homes: 32,
            avg: 180,
            x: 1.6,
            z: 0.6,
            photo: "/places/sehir-hastanesi.avif",
            tags: "Şehir Hastanesi, Acil Giriş",
        },
        {
            slug: "isola-brava",
            name: "Elazığ Havalimanı",
            kind: "Havalimanı Transfer",
            homes: 19,
            avg: 390,
            x: -3.1,
            z: 2.3,
            photo: "/places/havalimani.webp",
            tags: "VIP Transfer, Havalimanı",
        },
    ],
    hosts: [
        {
            slug: "ines",
            name: "Ahmet Yılmaz",
            first: "Ahmet Usta (23 T 0421)",
            place: "Elysium Park AVM",
            years: 8,
            rating: "4.97",
            reviews: 412,
            tone: "#E9C9A6",
        },
        {
            slug: "rafael",
            name: "Murat Kaya",
            first: "Murat Kaptan (23 T 0188)",
            place: "Elazığ Havalimanı",
            years: 9,
            rating: "4.95",
            reviews: 638,
            tone: "#BFD3DA",
        },
        {
            slug: "matteo",
            name: "Hasan Demir",
            first: "Hasan Usta (23 T 0312)",
            place: "Harput Kalesi",
            years: 11,
            rating: "4.96",
            reviews: 296,
            tone: "#C9D2B6",
        },
        {
            slug: "sanne",
            name: "Serkan Çelik",
            first: "Serkan Kaptan (23 T 0504)",
            place: "Hazar Gölü",
            years: 7,
            rating: "4.99",
            reviews: 524,
            tone: "#D6D0E8",
        },
        {
            slug: "leonor",
            name: "Kemal Arslan",
            first: "Kemal Usta (23 T 0094)",
            place: "Çarşı · Gazi Cd.",
            years: 6,
            rating: "4.94",
            reviews: 287,
            tone: "#F0D9B5",
        },
        {
            slug: "giulia",
            name: "Ömer Şahin",
            first: "Ömer Kaptan (23 T 0275)",
            place: "Fırat Üniversitesi",
            years: 7,
            rating: "4.96",
            reviews: 331,
            tone: "#E4C7C0",
        },
    ],
    stays: [
        {
            slug: "elysium-avm-carsidan",
            title: "Elysium AVM · Çarşı'dan",
            place: "Elysium Park AVM",
            host: "ines",
            type: "Sarı Taksi · 4.2 km (~8 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 200,
            cleaning: 0,
            rating: "4.97",
            reviews: 328,
            cats: "Standart, Hızlı",
            tag: "En Yakın Taksi",
            eta: "2 dk",
            fromText: "Çarşı Merkez → Elysium Park AVM",
            img: "/places/elysium.webp",
        },
        {
            slug: "elysium-avm-genis-taksi",
            title: "Elysium AVM · Geniş Taksi (XL)",
            place: "Elysium Park AVM",
            host: "rafael",
            type: "Geniş Araç · 6 Kişilik (~8 dk)",
            sleeps: 8,
            bedrooms: 6,
            price: 260,
            cleaning: 0,
            rating: "4.95",
            reviews: 174,
            cats: "XL, Aile",
            tag: "Geniş Bagaj",
            eta: "4 dk",
            fromText: "Çarşı Merkez → Elysium Park AVM",
            img: "/places/elysium.webp",
        },
        {
            slug: "harput-kalesi-carsidan",
            title: "Harput Kalesi · Çarşı'dan",
            place: "Harput Kalesi",
            host: "matteo",
            type: "Sarı Taksi · 7.5 km (~14 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 280,
            cleaning: 0,
            rating: "4.96",
            reviews: 186,
            cats: "Harput, Tur",
            tag: "Sabit Rota",
            eta: "3 dk",
            fromText: "Çarşı Merkez → Harput Kalesi",
            img: "/places/hilton.avif",
        },
        {
            slug: "harput-vip-taksi",
            title: "Harput · Konfor Taksi",
            place: "Harput Kalesi",
            host: "matteo",
            type: "Geniş Taksi · 6 Kişilik (~14 dk)",
            sleeps: 6,
            bedrooms: 6,
            price: 350,
            cleaning: 0,
            rating: "4.93",
            reviews: 102,
            cats: "Harput, Aile",
            tag: "Aile Boyu",
            eta: "5 dk",
            fromText: "Çarşı Merkez → Harput Kalesi",
            img: "photo-1696860740793-1bb7bf33cdc1",
        },
        {
            slug: "hazar-golu-merkezden",
            title: "Hazar Gölü · Merkez'den",
            place: "Hazar Gölü",
            host: "sanne",
            type: "Sarı Taksi · 26 km (~28 dk)",
            sleeps: 6,
            bedrooms: 4,
            price: 650,
            cleaning: 0,
            rating: "4.99",
            reviews: 212,
            cats: "Göl, Uzun Yol",
            tag: "Özel Fiyat",
            eta: "4 dk",
            fromText: "Elazığ Merkez → Hazar Gölü",
            img: "photo-1583878594798-c31409c8ab4a",
        },
        {
            slug: "hazar-golu-vip",
            title: "Hazar Gölü · VIP Vito",
            place: "Hazar Gölü",
            host: "sanne",
            type: "VIP Transfer · 6 Kişilik",
            sleeps: 6,
            bedrooms: 6,
            price: 850,
            cleaning: 0,
            rating: "4.96",
            reviews: 87,
            cats: "VIP, Göl",
            tag: "VIP Transfer",
            eta: "6 dk",
            fromText: "Elazığ Merkez → Hazar Gölü",
            img: "photo-1748063578185-3d68121b11ff",
        },
        {
            slug: "carsi-gazi-caddesi",
            title: "Çarşı · Gazi Caddesi",
            place: "Çarşı · Gazi Cd.",
            host: "leonor",
            type: "Sarı Taksi · 3.1 km (~6 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 150,
            cleaning: 0,
            rating: "4.94",
            reviews: 464,
            cats: "Merkez, Hızlı",
            tag: "1 dk Uzaklıkta",
            eta: "1 dk",
            fromText: "Cumhuriyet Mah. → Çarşı Merkez",
            img: "photo-1665249934445-1de680641f50",
        },
        {
            slug: "carsi-ogretmenevi",
            title: "Öğretmenevi · Çarşı Merkez",
            place: "Çarşı · Gazi Cd.",
            host: "leonor",
            type: "Sarı Taksi · 3.5 km (~7 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 165,
            cleaning: 0,
            rating: "4.91",
            reviews: 193,
            cats: "Merkez",
            tag: "Hızlı Kalkış",
            eta: "2 dk",
            fromText: "Ataşehir Mah. → Çarşı Merkez",
            img: "photo-1783990349147-906f62b882c1",
        },
        {
            slug: "firat-uni-carsidan",
            title: "Fırat Üniversitesi · Çarşı'dan",
            place: "Fırat Üniversitesi",
            host: "giulia",
            type: "Sarı Taksi · 3.8 km (~7 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 180,
            cleaning: 0,
            rating: "4.96",
            reviews: 241,
            cats: "Kampüs, Hastane",
            tag: "Kampüs Durağı",
            eta: "2 dk",
            fromText: "Çarşı Merkez → Fırat Üniversitesi",
            img: "/places/sehir-hastanesi.avif",
        },
        {
            slug: "firat-hastane-carsidan",
            title: "Fırat Araştırma Hastanesi",
            place: "Fırat Üniversitesi",
            host: "giulia",
            type: "Sarı Taksi · 4.0 km (~8 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 190,
            cleaning: 0,
            rating: "4.93",
            reviews: 158,
            cats: "Hastane, Acil",
            tag: "Öncelikli Araç",
            eta: "2 dk",
            fromText: "Çarşı Merkez → Araştırma Hastanesi",
            img: "/places/sehir-hastanesi.avif",
        },
        {
            slug: "elazig-havalimani-carsidan",
            title: "Havalimanı · Çarşı'dan",
            place: "Elazığ Havalimanı",
            host: "rafael",
            type: "Sarı Taksi · 12 km (~16 dk)",
            sleeps: 4,
            bedrooms: 4,
            price: 390,
            cleaning: 0,
            rating: "4.95",
            reviews: 288,
            cats: "Havalimanı, Transfer",
            tag: "Sabit Ücret",
            eta: "3 dk",
            fromText: "Çarşı Merkez → Elazığ Havalimanı",
            img: "/places/havalimani.webp",
        },
        {
            slug: "elazig-havalimani-vip",
            title: "Havalimanı · VIP Transfer",
            place: "Elazığ Havalimanı",
            host: "rafael",
            type: "Geniş Bagajlı · 6 Kişilik",
            sleeps: 6,
            bedrooms: 6,
            price: 490,
            cleaning: 0,
            rating: "4.94",
            reviews: 116,
            cats: "Havalimanı, VIP",
            tag: "Büyük Bagaj",
            eta: "5 dk",
            fromText: "Çarşı Merkez → Elazığ Havalimanı",
            img: "/places/havalimani.webp",
        },
    ],
    reviews: [
        {
            stay: "cliff-cottage-above-the-cove",
            name: "Hannah",
            from: "Leeds",
            date: "September 2026",
            score: 5,
            text: "The terrace is the whole reason to come. We ate every meal out there and swam in the cove twice a day.",
        },
        {
            stay: "cliff-cottage-above-the-cove",
            name: "Tomás",
            from: "Madrid",
            date: "August 2026",
            score: 5,
            text: "Inês left fresh bread and a hand-drawn map of the cliff path. Small cottage, huge view.",
        },
        {
            stay: "white-villa-with-a-sea-pool",
            name: "Claire",
            from: "Lyon",
            date: "July 2026",
            score: 5,
            text: "Four families, one villa, no arguments. The pool faces the sunset and the kitchen is properly equipped.",
        },
        {
            stay: "timber-hut-in-the-high-meadow",
            name: "Jonas",
            from: "Munich",
            date: "September 2026",
            score: 5,
            text: "Woke up to cowbells and cloud below the hut. Matteo's walk to the upper lake was the best day of the trip.",
        },
        {
            stay: "timber-hut-in-the-high-meadow",
            name: "Priya",
            from: "London",
            date: "June 2026",
            score: 4,
            text: "Cosy and very quiet. The last stretch of road is steep, so bring a car you trust.",
        },
        {
            stay: "stone-lodge-with-a-fireplace",
            name: "Erik",
            from: "Oslo",
            date: "February 2026",
            score: 5,
            text: "Genuinely ski-in, ski-out. Boot room with heaters, fire going when we arrived, and snow up to the windows.",
        },
        {
            stay: "lake-cabin-with-its-own-jetty",
            name: "Marta",
            from: "Porto",
            date: "August 2026",
            score: 5,
            text: "Sauna, jump in the lake, repeat. Our dog loved the jetty more than we did.",
        },
        {
            stay: "lake-cabin-with-its-own-jetty",
            name: "Daniel",
            from: "Zurich",
            date: "July 2026",
            score: 5,
            text: "Kayaked to the island for lunch every day. Everything you need and nothing you don't.",
        },
        {
            stay: "glass-house-at-the-waters-edge",
            name: "Aiko",
            from: "Berlin",
            date: "May 2026",
            score: 5,
            text: "Taking a bath while the lake goes pink is something I will think about for a long time.",
        },
        {
            stay: "sunny-flat-above-the-harbour",
            name: "Sam",
            from: "Dublin",
            date: "April 2026",
            score: 5,
            text: "Stayed five weeks to work. Fast Wi-Fi, a real desk and the best morning light I've had anywhere.",
        },
        {
            stay: "sunny-flat-above-the-harbour",
            name: "Léa",
            from: "Paris",
            date: "March 2026",
            score: 4,
            text: "Lovely flat, lively street. The fish market starts early, which we ended up enjoying.",
        },
        {
            stay: "warehouse-loft-by-the-fish-market",
            name: "Noah",
            from: "Amsterdam",
            date: "June 2026",
            score: 5,
            text: "The ceilings are unreal and the bikes meant we saw half the island without a car.",
        },
        {
            stay: "farmhouse-among-the-vines",
            name: "Giorgia",
            from: "Turin",
            date: "September 2026",
            score: 5,
            text: "We came for harvest week and helped pick for a morning. Dinner in the farm kitchen after was the highlight.",
        },
        {
            stay: "farmhouse-among-the-vines",
            name: "Oliver",
            from: "Bristol",
            date: "June 2026",
            score: 5,
            text: "Nine of us, three generations. The pool terrace kept the kids busy and the adults very happy.",
        },
        {
            stay: "a-frame-cabin-on-the-ridge",
            name: "Mia",
            from: "Vienna",
            date: "October 2026",
            score: 5,
            text: "Tiny, warm and well thought out. The view from the loft window over the vines is worth the ladder.",
        },
        {
            stay: "palm-garden-pool-house",
            name: "Lucas",
            from: "Lisbon",
            date: "August 2026",
            score: 5,
            text: "No cars, no noise, just the pool and the palms. Rafael arranged the ferry transfer for us.",
        },
        {
            stay: "beach-house-with-a-limewashed-terrace",
            name: "Sofia",
            from: "Barcelona",
            date: "July 2026",
            score: 5,
            text: "Jumped off the swimming rock every morning. The snorkel kit found us an octopus on day two.",
        },
        {
            stay: "beach-house-with-a-limewashed-terrace",
            name: "Ben",
            from: "Edinburgh",
            date: "June 2026",
            score: 4,
            text: "Beautiful house, very steep steps. Worth every one of them.",
        },
    ],
    img: {
        "photo-1770623230285-1bde49985620":
            "https://framerusercontent.com/images/8DBqdDmhhTmFbi9wPe5DOiaMDs.jpg",
        "photo-1605549339992-83721992836e":
            "https://framerusercontent.com/images/KA1PDIk6UCfXLgyq2vJD8W3qZ8.jpg",
        "photo-1727706572437-4fcda0cbd66f":
            "https://framerusercontent.com/images/ToXH1xsPESJJY6cqLhFN2S8i4s.jpg",
        "photo-1613977257363-707ba9348227":
            "https://framerusercontent.com/images/JnMQfjZpOTOPgH6yZhRqE60eX0.jpg",
        "photo-1598924957326-0446ac30341e":
            "https://framerusercontent.com/images/guAbxNmOex2vIXBssNPsCMN2WE.jpg",
        "photo-1620626011761-996317b8d101":
            "https://framerusercontent.com/images/hmBMDkZ8kplgyQ1t8LEvzk0P0.jpg",
        "photo-1731512820066-b6345f362ce3":
            "https://framerusercontent.com/images/B3ZzEsHFzM6vS5KNnuTy9OWkAY.jpg",
        "photo-1664369210144-90e51ddbbc30":
            "https://framerusercontent.com/images/ys0XMVK31xDgAQdVFRLn710EAo.jpg",
        "photo-1631756964162-25c8c07579b5":
            "https://framerusercontent.com/images/7TFTqBk4F2baA1CsNcg4x9o2TyY.jpg",
        "photo-1696860740793-1bb7bf33cdc1":
            "https://framerusercontent.com/images/jc5J4Muaw247aErm22n6WiQKWI.jpg",
        "photo-1680703312305-9e981230687c":
            "https://framerusercontent.com/images/kSDqLDPHagWvexHAuv2tgdXIH4Y.jpg",
        "photo-1628797279405-8cd6ffdbeb6c":
            "https://framerusercontent.com/images/zg2w9Cm6YuwIzRw5hQGHkMFJyMs.jpg",
        "photo-1583878594798-c31409c8ab4a":
            "https://framerusercontent.com/images/nrynCB0shZSfcXdEYukdOMKLRsg.jpg",
        "photo-1621571113981-f51bde2a125b":
            "https://framerusercontent.com/images/gD8VddyNxHgSTnaAtMVYHJEJk.jpg",
        "photo-1723111568816-48c31eca8132":
            "https://framerusercontent.com/images/JIyGWcN7lchs61DmrumfPaavJY.jpg",
        "photo-1748063578185-3d68121b11ff":
            "https://framerusercontent.com/images/KqSGjuUwInh2ggfmPrIKM3FXkk.jpg",
        "photo-1593672603619-48dc88e610c5":
            "https://framerusercontent.com/images/blONlu6F9Aafw6M8eoB7zQ7wyLY.jpg",
        "photo-1733426107854-ee00a25d72a7":
            "https://framerusercontent.com/images/kWvUopeiAGWPDwLBdfVzGizgb8.jpg",
        "photo-1665249934445-1de680641f50":
            "https://framerusercontent.com/images/nauTkyrhsCXMVl4Cb4ZUn7H0.jpg",
        "photo-1617695591915-87d753983ac0":
            "https://framerusercontent.com/images/zRj7BP91RjmPNWNV6ZsWmpuFg.jpg",
        "photo-1734599511415-cb4a52aea2fe":
            "https://framerusercontent.com/images/AMcqazGmgTcPZmJnaUj1Um3qw.jpg",
        "photo-1783990349147-906f62b882c1":
            "https://framerusercontent.com/images/dZHqPDcITVf27mvIwO1XQjn23Oc.jpg",
        "photo-1768413292179-d958b344f1d4":
            "https://framerusercontent.com/images/nz0BzQ2YWlqjI9g9zSFOaALV0.jpg",
        "photo-1738748444659-f8975b12ce57":
            "https://framerusercontent.com/images/P61F8a7N6WnlohXb9vgU2Xg4hP0.jpg",
        "photo-1558030929-66237a030c98":
            "https://framerusercontent.com/images/qIq50YMlwuVgAnkaaQWd6xNTsps.jpg",
        "photo-1754415267107-8a1f75a6a366":
            "https://framerusercontent.com/images/fUMcyeq0GHIYSZbWI2Og2iMzA.jpg",
        "photo-1768487422639-7ba3900d0f02":
            "https://framerusercontent.com/images/1sWjuuxzs8MOPvnikLMDrWljak.jpg",
        "photo-1785350876810-3d77ffa79d0c":
            "https://framerusercontent.com/images/RmQL6xPdwMMAe9GXoeyygvea8o.jpg",
        "photo-1727270921836-3d51d25d9e33":
            "https://framerusercontent.com/images/9TYttlL7XAIIN3a5pqbO1DTtM.jpg",
        "photo-1768486143865-342d8cc12c90":
            "https://framerusercontent.com/images/OxjGhpn9NyyPOx86P7fcipyKPhI.jpg",
        "photo-1721989519334-40923a0ee1c0":
            "https://framerusercontent.com/images/3BgMR5aHfz1sKo4JgKvsS3BVrk.jpg",
        "photo-1596178067639-5c6e68aea6dc":
            "https://framerusercontent.com/images/tzX7eH9QvHi4iNBzySAP7h0yJVM.jpg",
        "photo-1600488999585-e4364713b90a":
            "https://framerusercontent.com/images/O8lXKyQ1i2lZ8OpkO3CXYkrng8.jpg",
        "photo-1631528858266-5ebeb8bfc6f5":
            "https://framerusercontent.com/images/P5LTu5OQysQd2kTz58OQY2zHTk.jpg",
        "photo-1758907749704-7ad4e48b2aa0":
            "https://framerusercontent.com/images/S9wmoonhc14hnXIQVsnqKtLOSEo.jpg",
        "photo-1770941550709-a555ac4a69b3":
            "https://framerusercontent.com/images/7OICTO3Vkmv901qf5V5DhGZ0Y.jpg",
        "photo-1759764401172-c74feece43e7":
            "https://framerusercontent.com/images/SzXLh5LEz57hQ0Fc6XcuSDiGXGA.jpg",
        "photo-1780269197849-ee31eacad11f":
            "https://framerusercontent.com/images/sU7EsXZ6wfpuY4M1lSSqCTAtC9c.jpg",
        "photo-1760365576591-d1e50d085c22":
            "https://framerusercontent.com/images/GFS8ARdulC1whPvX2Nm2iTXxXTA.jpg",
        "photo-1569841195066-b3ecd1cbb863":
            "https://framerusercontent.com/images/49yxEF9Dw79rTaesEk1DHKGWwM.jpg",
        "photo-1688261559299-bfc4e280a89e":
            "https://framerusercontent.com/images/deVBVe5lm1hfwyF5w8osX7XoanQ.jpg",
        "photo-1598875222771-121d61559b9e":
            "https://framerusercontent.com/images/iNMmcJRJOyaeBv1JPgAZ94P3TY.jpg",
        "photo-1604300026894-75f90702c181":
            "https://framerusercontent.com/images/9tASKxsJOBWuxNH0WtfcGE1xy4.jpg",
        "photo-1758810741067-c20b49078b10":
            "https://framerusercontent.com/images/m4mFXnApyrxTGiZOPfVkZOY0IJo.jpg",
        "photo-1610066370580-f698d2ccfb69":
            "https://framerusercontent.com/images/GS7lX6QO0sHssOHAfJLgdVbM4.jpg",
        "photo-1561632669-7f55f7975606":
            "https://framerusercontent.com/images/5bb2HBLJG6WuavMrJPWvLI5R6Fs.jpg",
        "photo-1543418219-44e30b057fea":
            "https://framerusercontent.com/images/vG4Mk7UE7dgc7rzMergpqOtpIKA.jpg",
        "photo-1721808525294-34a81cbf70e0":
            "https://framerusercontent.com/images/wUkeSfzYbT293D1U5FAAXIXoOE.jpg",
    },
}
const U = (id: string, w = 900) =>
    /^https?:|^\/places\//.test(id)
        ? id
        : HDATA.img && HDATA.img[id]
          ? `${HDATA.img[id]}?scale-down-to=${w <= 520 ? 512 : 1024}`
          : `https://images.unsplash.com/${id}?w=${w}&q=72&auto=format&fit=crop`
const RMETA: Record<
    string,
    { coord: string; yaw: number; dist: number; spread: number }
> = {
    "costa-alva": {
        coord: "38.71°N  9.42°W",
        yaw: -0.32,
        dist: 1.0,
        spread: 1,
    },
    "val-serra": {
        coord: "46.52°N  11.31°E",
        yaw: 0.42,
        dist: 1.12,
        spread: 1,
    },
    "lago-mino": { coord: "45.94°N  8.61°E", yaw: 0.05, dist: 1.0, spread: 1 },
    "porto-lume": {
        coord: "38.79°N  9.18°W",
        yaw: -0.18,
        dist: 0.95,
        spread: 0.9,
    },
    "campo-vento": {
        coord: "43.47°N  11.25°E",
        yaw: 0.25,
        dist: 1.0,
        spread: 1,
    },
    "isola-brava": {
        coord: "38.52°N  9.61°W",
        yaw: -0.5,
        dist: 0.8,
        spread: 0.55,
    },
}
const REGIONS = (HDATA.places as any[]).map((p) => ({
    name: p.name,
    kind: p.kind,
    cx: p.x,
    cz: p.z,
    homes: p.homes,
    avg: p.avg,
    slug: p.slug,
    ...RMETA[p.slug],
}))
const AUTO = 3 // the autoplay tour visits the first three places
const HOSTS: Record<string, any> = {}
;(HDATA.hosts as any[]).forEach((h) => {
    HOSTS[h.slug] = h
})
const NIGHTS = 6

// ---------- deterministic noise ----------
function hash(x: number, y: number) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
    return s - Math.floor(s)
}
function vnoise(x: number, y: number) {
    const ix = Math.floor(x),
        iy = Math.floor(y),
        fx = x - ix,
        fy = y - iy
    const ux = fx * fx * (3 - 2 * fx),
        uy = fy * fy * (3 - 2 * fy)
    const a = hash(ix, iy),
        b = hash(ix + 1, iy),
        c = hash(ix, iy + 1),
        d = hash(ix + 1, iy + 1)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}
function fbm(x: number, y: number, o = 5) {
    let s = 0,
        a = 0.5,
        f = 1
    for (let i = 0; i < o; i++) {
        s += a * vnoise(x * f, y * f)
        f *= 2.03
        a *= 0.5
    }
    return s
}
function ridged(x: number, y: number) {
    let s = 0,
        a = 0.55,
        f = 1
    for (let i = 0; i < 5; i++) {
        const n = 1 - Math.abs(vnoise(x * f, y * f) * 2 - 1)
        s += a * n * n
        f *= 2.1
        a *= 0.5
    }
    return s
}
const g = (x: number, z: number, cx: number, cz: number, r: number) =>
    Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r))
function heightAt(x: number, z: number) {
    // Düz mimari şehir zemini (mikro eğimli)
    return 0.05
}

// Şehir caddeleri ve bulvar ızgarası kontrolü (0.85m aralıklı ana arterler)
const ROAD_GRID = 0.85
function isOnCityRoad(x: number, z: number, margin = 0.072) {
    // Kuzey-Güney ve Doğu-Batı cadde ızgarası
    const dx = Math.abs((((x / ROAD_GRID) % 1) + 1.5) % 1 - 0.5) * ROAD_GRID
    const dz = Math.abs((((z / ROAD_GRID) % 1) + 1.5) % 1 - 0.5) * ROAD_GRID
    if (dx < margin || dz < margin) return true
    // Ana bağlantı bulvarı (Gazi Cd. / Elysium / Harput ana arteri)
    const diagDist = Math.abs(z - (0.35 * x + 0.18)) / 1.059
    if (diagDist < margin + 0.015) return true
    return false
}

// ---------- easing ----------
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const eOut = (x: number) => 1 - Math.pow(1 - x, 3)
const eInOut = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
const eExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))
const eBack = (x: number) => {
    const c1 = 1.5,
        c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR") + " TL"

// ---------- timeline (Kart animasyonu: 7.5 sn kalır, yavaşça açılır ve yavaşça kapanır, döngüler arası 4 sn boşluk) ----------
const INTRO = 1.4,
    CYCLE = 8.4
const CARD_SHOW_DURATION = 7.5 // Ekranda kalma süresi (7-8 sn)
const CARD_GAP_DURATION = 4.0  // Döngüler arası dinlenme boşluğu
const CARD_PERIOD = CARD_SHOW_DURATION + CARD_GAP_DURATION // Toplam döngü: 11.5 sn

// Sırayla dönecek yerler: Elazığ Havalimanı (5), Fethi Sekin Şehir Hastanesi (4), Elysium Park AVM (0)
const ROTATION_PLACES = [5, 4, 0]

function timeline(t: number) {
    const intro = eExpo(seg(t, 0, INTRO))
    const u = Math.max(0, t - INTRO)
    
    // Her periyotta:
    // 7.5 saniye boyunca kart görünür: 0.9 saniyede çok yumuşak yavaşça açılır, ekranda kalır, son 0.9 saniyede yavaşça kapanır
    // Kalan sürede kart tamamen gizlenir ve sıradaki yere geçer
    let cardAnim = 0
    let rotIndex = 0
    const elapsed = u
    const cycleTime = elapsed % CARD_PERIOD
    rotIndex = Math.floor(elapsed / CARD_PERIOD) % ROTATION_PLACES.length
    
    if (cycleTime < CARD_SHOW_DURATION) {
        // Yumuşak ve yavaşça açılıp kapanması için 0.9 sn transition
        const inPhase = eInOut(seg(cycleTime, 0, 0.9))
        const outPhase = 1 - eInOut(seg(cycleTime, CARD_SHOW_DURATION - 0.9, CARD_SHOW_DURATION))
        cardAnim = Math.min(inPhase, outPhase)
    }

    const currentPlace = ROTATION_PLACES[rotIndex]
    const prev = 3 // Çarşı · Gazi Cd.
    const fly = eInOut(seg(u, 0, 1.2))

    return {
        intro,
        r: currentPlace,
        prev,
        u,
        fly,
        typing: seg(u + 0.6, 0.2, 1.1),
        sinkOld: seg(u, 0, 0.35),
        rise: 0,
        cal: 0,
        range: 0,
        total: 0,
        guests: 0,
        filter: 0,
        lift: cardAnim,
        card: cardAnim,
        drift: Math.min(u, 10),
    }
}

// ---------- pins (generated deterministically per place; the first ones are the place's real stays) ----------
interface Pin {
    x: number
    z: number
    y: number
    base: number
    cap: number
    sel: boolean
    stay: any
}
function makePins(ri: number): Pin[] {
    return []
}
const stayMeta = (st: any) => st.type || `${st.sleeps} kişilik taksi`
const stayHost = (st: any) => {
    const h = HOSTS[st.host]
    return h ? `${h.first} · ${h.years} yıllık sürücü` : ""
}

interface HeroProps {
    previewTime?: number
    headline?: string
    subline?: string
    eyebrow?: string
    searchLink?: string
    showNav?: boolean
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 */
export default function StaysiftHero(props: HeroProps) {
    const {
        previewTime = -1,
        headline = "Elazığ'da İlk Yolculuğa Özel\n%15 İndirimli Taksi.",
        subline = "Taksini tek tıkla canlı haritadan çağır, sabit fiyat garantisi ve anında %15 indirimle konforlu seyahat et.",
        eyebrow = "Elazığ'a özel açılış fırsatı · Sürpriz ücret yok, sabit tarife",
        searchLink = "/taksi",
        showNav = true,
    } = props
    const isStatic = useIsStaticRenderer()
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const uiRef = useRef<any>({})
    const allPins = useRef<Pin[][]>(REGIONS.map((_, i) => makePins(i)))
    // interactive search state (read by the render loop every frame)
    const userRef = useRef<any>({
        active: false,
        region: 0,
        prev: 0,
        flyT: 0,
        from: 12,
        to: 18,
        guests: 4,
        changeT: 0,
        cardT: 0,
        selKey: "",
        calOpen: false,
        cardClosed: false,
    })
    const lastAuto = useRef(0)
    const narrowRef = useRef(true)
    const [narrow, setNarrow] = React.useState(true)
    const [mid, setMid] = React.useState(true)
    const [sug, setSug] = React.useState<any[]>([])
    const [sugField, setSugField] = React.useState<"from" | "to">("to")
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [findingTaxi, setFindingTaxi] = React.useState(false)
    const [callModalOpen, setCallModalOpen] = React.useState(false)
    const [tariffModalOpen, setTariffModalOpen] = React.useState(false)
    const [partnerModalOpen, setPartnerModalOpen] = React.useState(false)
    const [partnerForm, setPartnerForm] = React.useState({ name: "", phone: "", plate: "" })
    const [partnerSent, setPartnerSent] = React.useState(false)
    const [selectedTab, setSelectedTab] = React.useState<"wallet" | "guest">("wallet")
    const [walletAmount, setWalletAmount] = React.useState(250)
    const [topupAgreed, setTopupAgreed] = React.useState(false)
    const [orderSuccess, setOrderSuccess] = React.useState(false)
    const [orderMode, setOrderMode] = React.useState<"member" | "cash">("member")
    const [callStep, setCallStep] = React.useState<"choose" | "cash-phone" | "topup">("choose")
    const [cashPhone, setCashPhone] = React.useState("")
    const [phoneErr, setPhoneErr] = React.useState<string | null>(null)
    const [searchWarn, setSearchWarn] = React.useState<string | null>(null)
    const [authUser, setAuthUser] = React.useState<{ fullName?: string; email?: string; phoneNumber?: string } | null>(null)
    const [fromCoord, setFromCoord] = React.useState<[number, number]>([38.6748, 39.2225])
    const [toCoord, setToCoord] = React.useState<[number, number]>([38.6748, 39.2225])
    const [hasFromPicked, setHasFromPicked] = React.useState(false)
    const [hasToPicked, setHasToPicked] = React.useState(false)
    const [routeInfo, setRouteInfo] = React.useState<{ km: number; min: number }>({ km: 0, min: 0 })
    const [mapPickerOpen, setMapPickerOpen] = React.useState(false)
    const [gpsConfirmMode, setGpsConfirmMode] = React.useState(false)
    const [mapPickerField, setMapPickerField] = React.useState<"from" | "to">("from")
    const [mapFromLabel, setMapFromLabel] = React.useState("")
    const [mapToLabel, setMapToLabel] = React.useState("")
    const mapPickerFieldRef = useRef<"from" | "to">("from")
    const mapDivRef = useRef<HTMLDivElement>(null)
    const leafletRef = useRef<any>(null)
    const modalOpenRef = useRef(false)
    modalOpenRef.current = Boolean(mapPickerOpen || callModalOpen || tariffModalOpen || partnerModalOpen || searchWarn)
    const fromTouchedRef = useRef(false)
    const whereTouchedRef = useRef(false)
    const menuWrapRef = useRef<HTMLDivElement>(null)
    const [, force] = React.useState(0)
    const compactNav = narrow || mid

    const getApiUrl = () => {
        const envUrl = (import.meta as any).env?.VITE_API_URL
        if (envUrl) return String(envUrl).replace(/\/$/, "")
        const h = window.location.hostname
        if (h === "localhost" || h.startsWith("10.") || h.startsWith("192.168.") || h.startsWith("127."))
            return `http://${h}:5080`
        return "https://api.paytaksi.com.tr"
    }

    const trackEvent = (eventType: string) => {
        fetch(`${getApiUrl()}/api/analytics/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventType }),
        }).catch(() => {})
    }

    useEffect(() => {
        trackEvent("page_view")
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

    useEffect(() => {
        if (!compactNav && menuOpen) setMenuOpen(false)
    }, [compactNav, menuOpen])

    useEffect(() => {
        if (!menuOpen) return
        const handleDown = (e: MouseEvent | TouchEvent) => {
            if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false)
        }
        window.addEventListener("mousedown", handleDown)
        window.addEventListener("touchstart", handleDown, { passive: true })
        window.addEventListener("keydown", handleKey)
        return () => {
            window.removeEventListener("mousedown", handleDown)
            window.removeEventListener("touchstart", handleDown)
            window.removeEventListener("keydown", handleKey)
        }
    }, [menuOpen])
    const activate = () => {
        const US = userRef.current
        if (US.active) return
        US.active = true
        US.region = lastAuto.current
        // Mevcut Konum (GPS) varsayılan olarak 3 (Çarşı · Gazi Cd.) koordinatında başlar
        US.prev = 3
        US.flyT = performance.now() / 1000 - 10
        US.from = 12
        US.to = 18
        US.guests = 4
        US.changeT = 0
        US.cardT = 0
    }
    const goFromRegion = (ri: number, label?: string) => {
        activate()
        const US = userRef.current,
            now = performance.now() / 1000
        if (US.region === ri) {
            US.region = ri === 0 ? 5 : 0
        }
        US.prev = ri
        US.flyT = now
        if (narrowRef.current) US.cardClosed = true
        const inp = uiRef.current.fromInput
        if (inp && label) inp.value = label
        fromTouchedRef.current = true
        setSearchWarn(null)
        setSug([])
    }
    const goRegion = (ri: number, label?: string) => {
        activate()
        const US = userRef.current,
            now = performance.now() / 1000
        if (ri !== US.region) {
            if (US.prev === ri) US.prev = US.region
            US.region = ri
            US.flyT = now
            US.selKey = ""
            US.cardClosed = false
        }
        const inp = uiRef.current.whereInput
        if (inp && label) inp.value = label
        whereTouchedRef.current = true
        setSearchWarn(null)
        setSug([])
    }

    const searchTimeout = useRef<any>(null)

    const YANDEX_API_KEY = "143da0f6-8fd6-4fec-a256-0e896c7cff60"

    const computeRoute = async (c1: [number, number], c2: [number, number]) => {
        // 1. Önce Yandex JS API ymaps.route varsa onu dene
        const ym = (window as any).ymaps
        if (ym && typeof ym.route === "function") {
            try {
                const route: any = await ym.route([c1, c2], { mapStateAutoApply: false, routingMode: "auto" })
                const distM = Number(route?.getLength?.() || 0)
                const timeS = Number(route?.getJamsTime?.() || route?.getTime?.() || 0)
                if (distM > 50) {
                    const km = Math.max(0.5, Math.round((distM / 1000) * 10) / 10)
                    const min = Math.max(2, Math.round(timeS / 60))
                    setRouteInfo({ km, min })
                    return
                }
            } catch {}
        }
        // 2. OSRM karayolu motoru (anında ve kesintisiz gerçek sürüş mesafesi)
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${c1[1]},${c1[0]};${c2[1]},${c2[0]}?overview=false`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                const r = data?.routes?.[0]
                if (r && r.distance > 0) {
                    const km = Math.max(0.5, Math.round((r.distance / 1000) * 10) / 10)
                    const min = Math.max(2, Math.round(r.duration / 60))
                    setRouteInfo({ km, min })
                    return
                }
            }
        } catch {}
        // 3. Haversine × 1.32 şehir içi yol katsayısı fallback
        const toRad = (d: number) => (d * Math.PI) / 180
        const dLat = toRad(c2[0] - c1[0])
        const dLon = toRad(c2[1] - c1[1])
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(c1[0])) * Math.cos(toRad(c2[0])) * Math.sin(dLon / 2) ** 2
        const airKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const km = Math.max(0.8, Math.round(airKm * 1.32 * 10) / 10)
        const min = Math.max(2, Math.round(km * 1.8))
        setRouteInfo({ km, min })
    }

    useEffect(() => {
        if (hasFromPicked && hasToPicked) {
            computeRoute(fromCoord, toCoord)
        }
    }, [fromCoord, toCoord, hasFromPicked, hasToPicked])

    const reverseGeocodeElazig = async (lat: number, lon: number): Promise<string> => {
        try {
            const r = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=tr`
            )
            if (r.ok) {
                const j = await r.json()
                const a = j?.address || {}
                const primary = a.amenity || a.building || a.shop || a.road || a.pedestrian || a.suburb || a.neighbourhood || ""
                const secondary = a.suburb || a.neighbourhood || a.quarter || a.town || a.city_district || "Elazığ"
                if (primary && secondary && primary !== secondary) return `${primary} · ${secondary}`
                if (primary) return primary
                if (j?.name) return String(j.name)
            }
        } catch {}
        return "Mevcut Konum"
    }

    const openMapPicker = (initialField: "from" | "to", isGpsConfirm = false) => {
        // Telefonda açık olan klavyeyi anında kapat
        if (uiRef.current.fromInput) uiRef.current.fromInput.blur()
        if (uiRef.current.whereInput) uiRef.current.whereInput.blur()
        if (document.activeElement && (document.activeElement as HTMLElement).blur) {
            ;(document.activeElement as HTMLElement).blur()
        }
        setSug([])
        setSearchWarn(null)
        setGpsConfirmMode(isGpsConfirm)
        setMapPickerField(initialField)
        mapPickerFieldRef.current = initialField
        setMapFromLabel(uiRef.current.fromInput?.value || "")
        setMapToLabel(uiRef.current.whereInput?.value || "")
        setMapPickerOpen(true)
    }

    useEffect(() => {
        mapPickerFieldRef.current = mapPickerField
    }, [mapPickerField])

    useEffect(() => {
        if (!mapPickerOpen) {
            if (leafletRef.current?.map) {
                try {
                    leafletRef.current.map.destroy()
                } catch {}
                leafletRef.current = null
            }
            return
        }
        let cancelled = false

        const initYandexMap = () => {
            if (cancelled) return
            const ym = (window as any).ymaps
            const el = mapDivRef.current
            if (!ym || !el || leafletRef.current?.map) return

            ym.ready(() => {
                if (cancelled || !mapDivRef.current || leafletRef.current?.map) return
                const startCenter = mapPickerFieldRef.current === "from" ? fromCoord : toCoord
                const map = new ym.Map(
                    mapDivRef.current,
                    {
                        center: startCenter,
                        zoom: 15,
                        controls: [],
                    },
                    {
                        suppressMapOpenBlock: true,
                        yandexMapDisablePoiInteractivity: true,
                    }
                )

                // Özel minimalist cam kapsül Alınış (Mavi) ve Bırakılış (Siyah) pin tasarımları
                const fromPinLayout = ym.templateLayoutFactory.createClass(
                    `<div style="position:relative;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:grab;user-select:none;">
                        <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px 5px 8px;border-radius:999px;background:rgba(255,255,255,0.96);backdrop-filter:blur(12px);border:1px solid rgba(58,58,244,0.22);box-shadow:0 10px 24px -6px rgba(16,17,24,0.32),0 2px 6px rgba(58,58,244,0.18);font-family:'Inter Tight',system-ui,sans-serif;font-size:12px;font-weight:700;color:#101114;white-space:nowrap;letter-spacing:-0.01em;">
                            <span style="width:8px;height:8px;border-radius:99px;background:#3A3AF4;box-shadow:0 0 0 3px rgba(58,58,244,0.18);display:inline-block;"></span>
                            <span>Alınış</span>
                        </div>
                        <div style="width:2px;height:8px;background:linear-gradient(180deg,#3A3AF4,rgba(58,58,244,0.5));"></div>
                        <div style="width:14px;height:14px;border-radius:99px;background:#3A3AF4;border:3px solid #fff;box-shadow:0 3px 10px rgba(58,58,244,0.55);margin-top:-1px;"></div>
                    </div>`
                )

                const toPinLayout = ym.templateLayoutFactory.createClass(
                    `<div style="position:relative;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:grab;user-select:none;">
                        <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px 5px 8px;border-radius:999px;background:rgba(16,17,20,0.94);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.22);box-shadow:0 10px 24px -6px rgba(16,17,24,0.42);font-family:'Inter Tight',system-ui,sans-serif;font-size:12px;font-weight:700;color:#fff;white-space:nowrap;letter-spacing:-0.01em;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none;">
                                <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z"></path>
                                <circle cx="12" cy="10" r="2.5"></circle>
                            </svg>
                            <span>Varış</span>
                        </div>
                        <div style="width:2px;height:8px;background:linear-gradient(180deg,#101114,rgba(16,17,20,0.5));"></div>
                        <div style="width:14px;height:14px;border-radius:99px;background:#101114;border:3px solid #fff;box-shadow:0 3px 10px rgba(16,17,20,0.45);margin-top:-1px;"></div>
                    </div>`
                )

                const pinShape = {
                    type: "Rectangle",
                    coordinates: [
                        [-42, -52],
                        [42, 6],
                    ],
                }

                const fromPlacemark = new ym.Placemark(
                    fromCoord,
                    {},
                    {
                        iconLayout: fromPinLayout,
                        iconShape: pinShape,
                        draggable: true,
                        zIndex: 1200,
                        zIndexHover: 1300,
                    }
                )
                const toPlacemark = new ym.Placemark(
                    toCoord,
                    {},
                    {
                        iconLayout: toPinLayout,
                        iconShape: pinShape,
                        draggable: true,
                        zIndex: 1100,
                        zIndexHover: 1250,
                        visible: whereTouchedRef.current,
                    }
                )
                const routeHalo = new ym.Polyline(
                    [fromCoord, toCoord],
                    {},
                    { strokeColor: "#3A3AF4", strokeWidth: 10, strokeOpacity: 0.18, visible: fromTouchedRef.current && whereTouchedRef.current }
                )
                const routeLine = new ym.Polyline(
                    [fromCoord, toCoord],
                    {},
                    { strokeColor: "#3A3AF4", strokeWidth: 4.5, strokeOpacity: 0.94, visible: fromTouchedRef.current && whereTouchedRef.current }
                )

                map.geoObjects.add(routeHalo)
                map.geoObjects.add(routeLine)
                map.geoObjects.add(fromPlacemark)
                map.geoObjects.add(toPlacemark)

                let routeAbort: AbortController | null = null
                let addrTimer: any = null

                const drawRealRoadRoute = async (c1: [number, number], c2: [number, number]) => {
                    if (!fromTouchedRef.current || !whereTouchedRef.current) {
                        routeHalo.options.set("visible", false)
                        routeLine.options.set("visible", false)
                        return
                    }
                    routeHalo.options.set("visible", true)
                    routeLine.options.set("visible", true)
                    if (routeAbort) routeAbort.abort()
                    routeAbort = new AbortController()
                    try {
                        const url = `https://router.project-osrm.org/route/v1/driving/${c1[1]},${c1[0]};${c2[1]},${c2[0]}?overview=simplified&geometries=geojson`
                        const res = await fetch(url, { signal: routeAbort.signal })
                        if (res.ok) {
                            const data = await res.json()
                            const r = data?.routes?.[0]
                            const coords = r?.geometry?.coordinates
                            if (Array.isArray(coords) && coords.length > 1) {
                                const pathLatLon = coords.map((pt: [number, number]) => [pt[1], pt[0]])
                                routeHalo.geometry.setCoordinates(pathLatLon)
                                routeLine.geometry.setCoordinates(pathLatLon)
                                if (r.distance > 0) {
                                    const km = Math.max(0.5, Math.round((r.distance / 1000) * 10) / 10)
                                    const min = Math.max(2, Math.round(r.duration / 60))
                                    setRouteInfo({ km, min })
                                }
                                return
                            }
                        }
                    } catch {}
                    routeHalo.geometry.setCoordinates([c1, c2])
                    routeLine.geometry.setCoordinates([c1, c2])
                }

                // Sadece hem Alınış hem Varış seçilmişse karayolu rotasını çiz
                if (fromTouchedRef.current && whereTouchedRef.current) {
                    drawRealRoadRoute(fromCoord, toCoord)
                }

                const resolveAddress = async (lat: number, lon: number): Promise<string> => {
                    try {
                        const res: any = await ym.geocode([lat, lon], { results: 1 })
                        const first = res?.geoObjects?.get?.(0)
                        const name = first?.getAddressLine?.() || first?.properties?.get?.("name")
                        if (name) return String(name).replace(/^Türkiye,\s*Elazığ,\s*/i, "")
                    } catch {}
                    return await reverseGeocodeElazig(lat, lon)
                }

                const applyCoord = (which: "from" | "to", lat: number, lon: number) => {
                    const c: [number, number] = [lat, lon]
                    if (which === "from") {
                        fromPlacemark.geometry.setCoordinates(c)
                        setFromCoord(c)
                        fromTouchedRef.current = true
                        setHasFromPicked(true)
                    } else {
                        toPlacemark.options.set("visible", true)
                        toPlacemark.geometry.setCoordinates(c)
                        setToCoord(c)
                        whereTouchedRef.current = true
                        setHasToPicked(true)
                    }
                    const curFrom = fromPlacemark.geometry.getCoordinates() as [number, number]
                    const curTo = toPlacemark.geometry.getCoordinates() as [number, number]
                    if (addrTimer) clearTimeout(addrTimer)
                    addrTimer = setTimeout(async () => {
                        if (fromTouchedRef.current && whereTouchedRef.current) {
                            drawRealRoadRoute(curFrom, curTo)
                        }
                        const addr = await resolveAddress(lat, lon)
                        if (cancelled) return
                        if (which === "from") {
                            setMapFromLabel(addr)
                            if (uiRef.current.fromInput) uiRef.current.fromInput.value = addr
                        } else {
                            setMapToLabel(addr)
                            if (uiRef.current.whereInput) uiRef.current.whereInput.value = addr
                        }
                    }, 160)
                }

                fromPlacemark.events.add("dragend", () => {
                    const c = fromPlacemark.geometry.getCoordinates()
                    setMapPickerField("from")
                    applyCoord("from", c[0], c[1])
                })
                toPlacemark.events.add("dragend", () => {
                    const c = toPlacemark.geometry.getCoordinates()
                    setMapPickerField("to")
                    applyCoord("to", c[0], c[1])
                })
                map.events.add("click", (e: any) => {
                    const c = e.get("coords")
                    if (Array.isArray(c) && c.length === 2) {
                        applyCoord(mapPickerFieldRef.current, c[0], c[1])
                    }
                })

                leafletRef.current = {
                    map: {
                        destroy: () => map.destroy(),
                        panTo: (c: [number, number]) => map.panTo(c, { flying: true }),
                        zoomIn: () => map.setZoom(Math.min(19, map.getZoom() + 1), { duration: 180 }),
                        zoomOut: () => map.setZoom(Math.max(9, map.getZoom() - 1), { duration: 180 }),
                        locateMe: () => {
                            if (!navigator.geolocation) return
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    const { latitude, longitude } = pos.coords
                                    const inElazig = latitude > 38.25 && latitude < 39.15 && longitude > 38.5 && longitude < 40.2
                                    const c: [number, number] = inElazig ? [latitude, longitude] : [38.6748, 39.2225]
                                    map.setCenter(c, 16, { duration: 220 })
                                    applyCoord(mapPickerFieldRef.current, c[0], c[1])
                                },
                                () => {},
                                { enableHighAccuracy: true, timeout: 5000 }
                            )
                        },
                    },
                    applyCoord,
                }

                // Sadece gerçek GPS izni alındığında haritayı kullanıcının konumuna kaydır ve yer adı biliniyorsa göster
                if (mapPickerFieldRef.current === "from" && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            if (cancelled) return
                            const { latitude, longitude } = pos.coords
                            const inElazig = latitude > 38.25 && latitude < 39.15 && longitude > 38.5 && longitude < 40.2
                            if (inElazig) {
                                map.setCenter([latitude, longitude], 16)
                                fromPlacemark.geometry.setCoordinates([latitude, longitude])
                                setFromCoord([latitude, longitude])
                                const addr = await resolveAddress(latitude, longitude)
                                if (!cancelled) setMapFromLabel(addr || "Mevcut Konum")
                            }
                        },
                        () => {},
                        { enableHighAccuracy: true, timeout: 5000 }
                    )
                }
            })
        }

        if ((window as any).ymaps) {
            initYandexMap()
        } else {
            const existing = document.getElementById("yandex-maps-js") as HTMLScriptElement | null
            if (existing) {
                existing.addEventListener("load", initYandexMap)
            } else {
                const s = document.createElement("script")
                s.id = "yandex-maps-js"
                s.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=tr_TR`
                s.onload = initYandexMap
                document.head.appendChild(s)
            }
        }

        return () => {
            cancelled = true
            if (leafletRef.current?.map) {
                try {
                    leafletRef.current.map.destroy()
                } catch {}
                leafletRef.current = null
            }
        }
    }, [mapPickerOpen])

    const pickPlaceItem = (item: { name: string; lat: number; lon: number; ri?: number; isGps?: boolean; isMap?: boolean }, field: "from" | "to") => {
        if (item.isMap) {
            openMapPicker(field, false)
            return
        }
        if (item.isGps) {
            openMapPicker("from", true)
            return
        }
        const ri = typeof item.ri === "number" ? item.ri : field === "from" ? 3 : 0

        if (field === "from") {
            setFromCoord([item.lat, item.lon])
            setHasFromPicked(true)
            if (uiRef.current.fromInput) {
                uiRef.current.fromInput.value = item.name
                uiRef.current.fromInput.blur()
            }
            fromTouchedRef.current = true
            setSearchWarn(null)
            setSug([])
            setTimeout(() => goFromRegion(ri, item.name), 120)
        } else {
            setToCoord([item.lat, item.lon])
            setHasToPicked(true)
            if (uiRef.current.whereInput) {
                uiRef.current.whereInput.value = item.name
                uiRef.current.whereInput.blur()
            }
            whereTouchedRef.current = true
            setSearchWarn(null)
            setSug([])
            setTimeout(() => {
                goRegion(ri)
                if (uiRef.current.whereInput) uiRef.current.whereInput.value = item.name
            }, 120)
        }
    }

    const searchPlaces = (text: string, field: "from" | "to") => {
        setSugField(field)
        const q = (text || "").trim()
        if (searchTimeout.current) clearTimeout(searchTimeout.current)

        if (q.length === 0) {
            if (field === "from") {
                setSug([
                    { slug: "gps", name: "Mevcut Konum", sub: "GPS · En yakın taksi ~2 dk", lat: 38.6748, lon: 39.2225, ri: 3, isGps: true },
                    { slug: "map-from", name: "Haritadan Seç", sub: "Elazığ haritası üzerinden alınış noktası işaretle", lat: 38.6748, lon: 39.2225, ri: 3, isMap: true },
                ])
            } else {
                setSug([
                    { slug: "map-to", name: "Haritadan Seç", sub: "Elazığ haritası üzerinden varış noktası işaretle", lat: 38.6688, lon: 39.1932, ri: 0, isMap: true },
                ])
            }
            return
        }

        if (q.length < 2) return

        searchTimeout.current = setTimeout(async () => {
            const remoteItems: Array<{ slug: string; name: string; sub: string; lat: number; lon: number; ri: number }> = []
            const addUnique = (name: string, sub: string, lat: number, lon: number, prefix: string) => {
                if (!name || isNaN(lat) || isNaN(lon)) return
                const cleanName = name.trim()
                if (remoteItems.some((r) => r.name.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR"))) return
                remoteItems.push({
                    slug: `${prefix}-${remoteItems.length}-${cleanName}`,
                    name: cleanName,
                    sub: sub || "Elazığ",
                    lat,
                    lon,
                    ri: field === "from" ? 3 : 0,
                })
            }

            let cleanQ = q
                .replace(/\belaz[ıiâ]ğ\b/gi, "")
                .replace(/\bhavaliman[ıi]\b/gi, "havaalanı")
                .trim()
            if (!cleanQ) cleanQ = q

            // 1. Yandex Maps JS API (ymaps.geocode)
            if ((window as any).ymaps?.geocode) {
                try {
                    const res: any = await (window as any).ymaps.geocode("Elazığ " + cleanQ, {
                        boundedBy: [
                            [38.4, 38.8],
                            [38.95, 39.65],
                        ],
                        strictBounds: true,
                        results: 4,
                    })
                    const geoObjects = res?.geoObjects
                    if (geoObjects && typeof geoObjects.each === "function") {
                        geoObjects.each((obj: any) => {
                            const coords = obj.geometry?.getCoordinates?.()
                            const name = obj.properties?.get?.("name")
                            const desc = obj.properties?.get?.("description")
                            if (Array.isArray(coords) && coords.length === 2 && name) {
                                addUnique(
                                    String(name),
                                    String(desc || "Elazığ").replace(/^Türkiye,\s*/i, ""),
                                    Number(coords[0]),
                                    Number(coords[1]),
                                    "ym"
                                )
                            }
                        })
                    }
                } catch {}
            }

            // 2. Yedek arama (Eğer Yandex anahtarı henüz aktifleşmediyse boş kalmaması için)
            if (remoteItems.length < 3) {
                try {
                    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&viewbox=38.60,39.00,39.70,38.35&bounded=1&limit=6&accept-language=tr`
                    const osmRes = await fetch(osmUrl)
                    if (osmRes.ok) {
                        const osmList = await osmRes.json()
                        ;(osmList || []).forEach((it: any) => {
                            const parts = String(it.display_name || "").split(",").map((s) => s.trim())
                            const title = it.name || parts[0] || cleanQ
                            const sub = parts
                                .filter((p) => p && p !== title && !/^(Türkiye|Doğu Anadolu Bölgesi|\d{5})$/i.test(p))
                                .slice(0, 2)
                                .join(" · ") || "Elazığ"
                            addUnique(title, sub, Number(it.lat), Number(it.lon), "osm")
                        })
                    }
                } catch {}
            }

            // 2. Photon Canlı Arama API (Elazığ bbox kilitli, sadece cleanQ ile)
            if (remoteItems.length < 3) {
                try {
                    const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&lat=38.6748&lon=39.2225&bbox=38.60,38.35,39.70,39.00&limit=8`
                    const pRes = await fetch(pUrl)
                    if (pRes.ok) {
                        const pData = await pRes.json()
                        ;(pData?.features || []).forEach((f: any) => {
                            const props = f?.properties || {}
                            const coords = f?.geometry?.coordinates || []
                            const lon = Number(coords[0])
                            const lat = Number(coords[1])
                            const title = props.name || props.street || props.district || ""
                            if (!title) return
                            // Kullanıcı "yolu" yazmadıysa şehirlerarası çevre yollarını filtrele
                            if (!/yol/i.test(cleanQ) && /^El[aâ]z[ıi]ğ-.*yolu$/i.test(title)) return
                            const subParts = [props.district, props.street, props.city || "Elazığ"].filter(
                                (x) => x && x !== title
                            )
                            addUnique(title, subParts.slice(0, 2).join(" · ") || "Elazığ", lat, lon, "ph")
                        })
                    }
                } catch {}
            }

            const top3 = remoteItems.slice(0, 3)
            setSug(top3)
        }, 200)
    }

    const onFrom = (e: any) => {
        activate()
        userRef.current.cardClosed = true
        searchPlaces(e.target.value, "from")
    }
    const onWhere = (e: any) => {
        activate()
        userRef.current.cardClosed = true
        searchPlaces(e.target.value, "to")
    }
    const swapLocations = () => {
        activate()
        const US = userRef.current,
            now = performance.now() / 1000
        const oldPrev = US.prev
        US.prev = US.region
        US.region = oldPrev
        US.flyT = now
        US.selKey = ""
        US.cardClosed = false
        const prevFromVal = uiRef.current.fromInput?.value || REGIONS[US.prev].name
        const prevWhereVal = uiRef.current.whereInput?.value || REGIONS[US.region].name
        if (uiRef.current.fromInput) uiRef.current.fromInput.value = prevWhereVal
        if (uiRef.current.whereInput) uiRef.current.whereInput.value = prevFromVal
        const oldFromC = fromCoord
        setFromCoord(toCoord)
        setToCoord(oldFromC)
        setSug([])
    }
    const pickDay = (d: number) => {
        activate()
        const US = userRef.current
        if (!US.to && d > US.from) {
            US.to = d
            US.calOpen = false
        } else {
            US.from = d
            US.to = 0
        }
        US.changeT = performance.now() / 1000
        force((x) => x + 1)
    }
    const setGuests = (k: number) => {
        activate()
        const US = userRef.current
        US.guests = clamp(US.guests + k, 1, 12)
        US.changeT = performance.now() / 1000
        US.selKey = ""
        US.cardT = US.changeT
        US.cardClosed = false
        force((x) => x + 1)
    }
    const toggleCal = () => {
        activate()
        const US = userRef.current
        US.calOpen = !US.calOpen
        setSug([])
        force((x) => x + 1)
    }
    const pickPin = (key: string) => {
        activate()
        const US = userRef.current
        const ri = Number(key.split("-")[0])
        if (ri !== US.region) return
        US.selKey = key
        US.cardT = performance.now() / 1000
        US.cardClosed = false
    }
    const closeCard = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        activate()
        userRef.current.cardClosed = true
    }
    const doSearch = (e: any) => {
        if (e && e.preventDefault) e.preventDefault()
        trackEvent("call_click")
        const fromVal = (uiRef.current.fromInput?.value || "").trim()
        const whereVal = (uiRef.current.whereInput?.value || "").trim()
        const hasFrom = fromTouchedRef.current && fromVal.length > 0
        const hasWhere = whereTouchedRef.current && whereVal.length > 0
        if (!hasFrom || !hasWhere) {
            setSearchWarn("Taksi çağırabilmek için lütfen önce Nereden ve Nereye bilgilerini doldurun.")
            activate()
            return
        }
        setSearchWarn(null)
        activate()
        setOrderSuccess(false)
        setCallStep("choose")
        setCashPhone("")
        setPhoneErr(null)
        setCallModalOpen(true)
        trackEvent("payment_open")
    }

    useEffect(() => {
        if (typeof window === "undefined") return
        const root = rootRef.current,
            canvas = canvasRef.current
        if (!root || !canvas) return
        // fonts
        if (!document.getElementById("staysift-fonts")) {
            const l = document.createElement("link")
            l.id = "staysift-fonts"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
            document.head.appendChild(l)
        }
        // Telefon ve mobil cihazlarda performansı uçurmak için ppr ve gölge optimizasyonu
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768
        let renderer: any
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: !isMobileDevice,
                alpha: false,
                powerPreference: "high-performance",
            })
        } catch (e) {
            return
        }
        // Mobilde pixelRatio 1.0 (veya max 1.25) yapılarak GPU yükü %75 düşürülür
        renderer.setPixelRatio(Math.min(isMobileDevice ? 1.2 : 1.75, window.devicePixelRatio || 1))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.02
        renderer.outputColorSpace = THREE.SRGBColorSpace
        // Gölgelendirmeyi tamamen kaldırıyoruz (temiz, sade ve hafif 3D görünüm)
        renderer.shadowMap.enabled = false
        const scene = new THREE.Scene()
        const bg = new THREE.Color(C.bg)
        scene.background = bg
        scene.fog = new THREE.Fog(bg, 5.6, 12.5)
        const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40)

        // light
        const hemi = new THREE.HemisphereLight(0xfdfcff, 0xcfc5b0, 0.85)
        scene.add(hemi)
        // Gölgelendirme kapalı
        const sun = new THREE.DirectionalLight(0xffe9cf, 3.4)
        sun.castShadow = false
        sun.shadow.bias = -0.0004
        sun.shadow.normalBias = 0.012
        const sc = sun.shadow.camera
        sc.left = -2.4
        sc.right = 2.4
        sc.top = 2.4
        sc.bottom = -2.4
        sc.near = 0.1
        sc.far = 14
        scene.add(sun)
        scene.add(sun.target)

        // terrain (hafif, düz mimari şehir maketi ve siyahımsı cadde ağı)
        const N = 80,
            SIZE = 10
        const geo = new THREE.PlaneGeometry(SIZE, SIZE, N, N)
        geo.rotateX(-Math.PI / 2)
        const pos = geo.attributes.position
        const H0 = new Float32Array(pos.count)
        const col = new Float32Array(pos.count * 3)
        const cGround = new THREE.Color("#ECE7DF"),
            cBlock = new THREE.Color("#E2DDD2"),
            cPark = new THREE.Color("#CAD6BD")
        const tmp = new THREE.Color()
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i),
                z = pos.getZ(i)
            const h = heightAt(x, z)
            H0[i] = h
            const n = vnoise(x * 1.5 + 7, z * 1.5 - 3)
            if (n > 0.72) tmp.copy(cGround).lerp(cPark, 0.7)
            else tmp.copy(cGround).lerp(cBlock, n * 0.5)
            col[i * 3] = tmp.r
            col[i * 3 + 1] = tmp.g
            col[i * 3 + 2] = tmp.b
        }
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3))
        const terrainMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.92,
            metalness: 0,
        })
        terrainMat.onBeforeCompile = (sh: any) => {
            sh.vertexShader = sh.vertexShader
                .replace(
                    "#include <common>",
                    "#include <common>\nvarying vec2 vW;\nuniform float uHS;"
                )
                .replace(
                    "#include <begin_vertex>",
                    "#include <begin_vertex>\nvW = position.xz;"
                )
            sh.uniforms.uHS = { value: 1 }
            terrainMat.userData.sh = sh
            sh.fragmentShader = sh.fragmentShader
                .replace(
                    "#include <common>",
                    "#include <common>\nvarying vec2 vW;"
                )
                .replace(
                    "#include <color_fragment>",
                    `#include <color_fragment>
                  // Şehir cadde ve bulvar ızgarası (0.85m aralıklarla ana yollar)
                  float rScale = 1.0 / 0.85;
                  vec2 rDist = abs(fract(vW * rScale) - 0.5) * 0.85;
                  // Grid yolları (genişlik 0.12)
                  float roadX = 1.0 - smoothstep(0.056, 0.062, rDist.x);
                  float roadZ = 1.0 - smoothstep(0.056, 0.062, rDist.y);
                  // Ana bağlantı bulvarı (Elysium <-> Çarşı)
                  float diagDist = abs(vW.y - (0.35 * vW.x + 0.18)) / 1.059;
                  float roadDiag = 1.0 - smoothstep(0.068, 0.076, diagDist);
                  float isRoad = clamp(max(max(roadX, roadZ), roadDiag), 0.0, 1.0);

                  // Kaldırım bordürü (yolun dış çevresi)
                  float curbX = (1.0 - smoothstep(0.062, 0.074, rDist.x)) * (1.0 - roadX);
                  float curbZ = (1.0 - smoothstep(0.062, 0.074, rDist.y)) * (1.0 - roadZ);
                  float curbD = (1.0 - smoothstep(0.076, 0.088, diagDist)) * (1.0 - roadDiag);
                  float isCurb = clamp(max(max(curbX, curbZ), curbD), 0.0, 1.0);

                  // Yol rengi: Şık koyu antrasit / siyahımsı asfalt
                  vec3 asphalt = vec3(0.20, 0.21, 0.24);
                  vec3 curbCol = vec3(0.92, 0.90, 0.86);

                  // Beyaz kesikli orta şerit çizgileri
                  float dashZ = (1.0 - smoothstep(0.003, 0.006, rDist.x)) * step(0.42, fract(vW.y * 7.5)) * (1.0 - roadZ);
                  float dashX = (1.0 - smoothstep(0.003, 0.006, rDist.y)) * step(0.42, fract(vW.x * 7.5)) * (1.0 - roadX);
                  float dashD = (1.0 - smoothstep(0.004, 0.007, diagDist)) * step(0.42, fract(vW.x * 7.0));
                  float laneLine = clamp(max(max(dashX, dashZ), dashD), 0.0, 1.0);

                  // Kavşaklarda yaya geçitleri (zebra çizgileri)
                  float nearX = step(0.062, rDist.x) * (1.0 - step(0.105, rDist.x));
                  float nearZ = step(0.062, rDist.y) * (1.0 - step(0.105, rDist.y));
                  float zebraX = nearZ * (1.0 - smoothstep(0.054, 0.060, rDist.x)) * step(0.48, fract(vW.x * 45.0));
                  float zebraZ = nearX * (1.0 - smoothstep(0.054, 0.060, rDist.y)) * step(0.48, fract(vW.y * 45.0));
                  float crosswalk = clamp(zebraX + zebraZ, 0.0, 1.0);

                  // Katmanları birleştir
                  diffuseColor.rgb = mix(diffuseColor.rgb, curbCol, isCurb * 0.8);
                  diffuseColor.rgb = mix(diffuseColor.rgb, asphalt, isRoad);
                  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.96, 0.95, 0.92), (laneLine + crosswalk) * isRoad * 0.92);`
                )
        }
        const terrain = new THREE.Mesh(geo, terrainMat)
        terrain.receiveShadow = true
        terrain.castShadow = false
        scene.add(terrain)

        const m4 = new THREE.Matrix4(),
            q = new THREE.Quaternion(),
            v3 = new THREE.Vector3(),
            sv = new THREE.Vector3(),
            eul = new THREE.Euler()

        // Sık ve zengin şehir binaları (bloklar halinde dolu şehir dokusu)
        const hs: {
            x: number
            z: number
            w: number
            d: number
            h: number
            r: number
            colType: number
        }[] = []
        let s = 19
        const rnd = () => {
            s = (s * 16807) % 2147483647
            return s / 2147483647
        }
        const addHouse = (
            x: number,
            z: number,
            w = 0.06,
            d = 0.05,
            h = 0.04,
            r = 0,
            colType = 0
        ) => {
            if (isOnCityRoad(x, z, 0.068)) return
            if (hs.some((o) => Math.hypot(o.x - x, o.z - z) < 0.042)) return
            hs.push({ x, z, w, d, h, r, colType })
        }

        // Şehir adaları üzerinden yoğun yapılaşma üret
        for (let bx = -4; bx <= 3; bx++) {
            for (let bz = -4; bz <= 3; bz++) {
                const cx = (bx + 0.5) * ROAD_GRID
                const cz = (bz + 0.5) * ROAD_GRID

                // Şehir merkezine yakınlık (Elysium ve Çarşı çevresinde daha yüksek ve sık kuleler)
                const dCenter = Math.hypot(cx + 1.5, cz + 0.3)
                const isDowntown = dCenter < 1.8
                const isParkBlock = !isDowntown && rnd() < 0.12

                if (isParkBlock) continue // Bazı blokları yeşil şehir parkı bırak

                // Blok içi 4x4 alt ızgarada binalar yerleştir
                const subOffsets = [-0.25, -0.09, 0.09, 0.25]
                for (let sx = 0; sx < subOffsets.length; sx++) {
                    for (let sz = 0; sz < subOffsets.length; sz++) {
                        if (rnd() < 0.15) continue // ufak avlu / boşluk bırak

                        const px = cx + subOffsets[sx] + (rnd() - 0.5) * 0.02
                        const pz = cz + subOffsets[sz] + (rnd() - 0.5) * 0.02

                        const isCorner =
                            (sx === 0 || sx === 3) && (sz === 0 || sz === 3)
                        const bw = (0.055 + rnd() * 0.035) * (isCorner ? 1.15 : 1)
                        const bd = (0.05 + rnd() * 0.03) * (isCorner ? 1.15 : 1)

                        let bh = 0.035 + rnd() * 0.055
                        if (isDowntown) {
                            bh = isCorner
                                ? 0.09 + rnd() * 0.16
                                : 0.05 + rnd() * 0.11
                        } else if (rnd() < 0.08) {
                            bh = 0.08 + rnd() * 0.12 // ara sıra yüksek apartman
                        }

                        const rot = Math.round(rnd() * 3) * 1.5708
                        const colType = Math.floor(rnd() * 4) // renk varyasyonu

                        addHouse(px, pz, bw, bd, bh, rot, colType)
                    }
                }
            }
        }

        const boxG = new THREE.BoxGeometry(1, 1, 1)
        boxG.translate(0, 0.5, 0)
        const roofG = new THREE.BoxGeometry(0.88, 0.05, 0.88)
        roofG.translate(0, 0.025, 0)

        const houseMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.72,
            metalness: 0.0,
        })
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0xede7dc,
            roughness: 0.8,
            metalness: 0.0,
        })
        const houses = new THREE.InstancedMesh(boxG, houseMat, hs.length)
        houses.castShadow = true
        houses.receiveShadow = true
        const roofs = new THREE.InstancedMesh(roofG, roofMat, hs.length)
        roofs.castShadow = true
        roofs.receiveShadow = true

        scene.add(houses)
        scene.add(roofs)

        // Düzenli ve seyrek ağaç yerleşimi (yollardan uzak, temiz park ve ada dokuları)
        const trees: { x: number; z: number; s: number; c: number }[] = []
        for (let j = 0; j < 2500 && trees.length < 180; j++) {
            const x = (rnd() - 0.5) * 8.0,
                z = (rnd() - 0.5) * 8.0
            // Yollardan belirgin şekilde uzak tut (0.16 pay)
            if (isOnCityRoad(x, z, 0.16)) continue
            // Evlerin ve binaların içine girmesin
            if (
                hs.some(
                    (o) =>
                        Math.abs(o.x - x) < 0.07 && Math.abs(o.z - z) < 0.07
                )
            )
                continue
            trees.push({ x, z, s: 0.012 + rnd() * 0.006, c: rnd() })
        }
        const treeG = new THREE.IcosahedronGeometry(1, 1)
        treeG.scale(1, 1.25, 1)
        treeG.translate(0, 1.0, 0)
        const treeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            flatShading: true,
        })
        const treeMesh = new THREE.InstancedMesh(treeG, treeMat, trees.length)
        treeMesh.castShadow = false
        treeMesh.receiveShadow = false
        const tc1 = new THREE.Color("#8FA680"),
            tc2 = new THREE.Color("#6E8864")
        trees.forEach((tr, i) =>
            treeMesh.setColorAt(i, tmp.copy(tc1).lerp(tc2, tr.c))
        )
        scene.add(treeMesh)

        // Siyahımsı caddelerde akan sarı mikro-taksiler
        const taxis: {
            axis: "x" | "z" | "d"
            line: number
            offset: number
            speed: number
            dir: number
        }[] = []
        for (let k = -4; k <= 3; k++) {
            const coord = (k + 0.5) * ROAD_GRID
            taxis.push({
                axis: "x",
                line: coord,
                offset: rnd() * 8 - 4,
                speed: 0.28 + rnd() * 0.18,
                dir: k % 2 === 0 ? 1 : -1,
            })
            taxis.push({
                axis: "z",
                line: coord,
                offset: rnd() * 8 - 4,
                speed: 0.28 + rnd() * 0.18,
                dir: k % 2 === 0 ? -1 : 1,
            })
        }
        for (let k = 0; k < 10; k++) {
            taxis.push({
                axis: "d",
                line: 0,
                offset: (k / 10) * 8 - 4,
                speed: 0.35,
                dir: k % 2 === 0 ? 1 : -1,
            })
        }
        const taxiG = new THREE.BoxGeometry(0.038, 0.015, 0.02)
        taxiG.translate(0, 0.009, 0)
        const taxiMat = new THREE.MeshStandardMaterial({
            color: 0xf5b800,
            roughness: 0.35,
            metalness: 0.1,
        })
        const taxiMesh = new THREE.InstancedMesh(taxiG, taxiMat, taxis.length)
        taxiMesh.castShadow = true
        scene.add(taxiMesh)

        // Eski kıvrımlı ada yolunu gizle
        const road = new THREE.Group()
        road.visible = false
        scene.add(road)
        // pin ground markers (small discs) in 3D, so pins sit ON the model
        const discG = new THREE.CylinderGeometry(1, 1, 0.004, 32)
        const flat: Pin[] = ([] as Pin[]).concat(...allPins.current)
        const discs = new THREE.InstancedMesh(
            discG,
            new THREE.MeshBasicMaterial({ color: 0xffffff }),
            flat.length
        )
        scene.add(discs)

        // route arc drawn during a flight between places
        const arcMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(C.accent),
            transparent: true,
            opacity: 0.9,
            fog: false,
        })
        let arc: any = null,
            arcKey = ""
        const dotMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(C.accent),
            fog: false,
        })
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.022, 20, 12),
            dotMat
        )
        scene.add(dot)
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.03, 0.036, 40).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(C.accent),
                transparent: true,
                fog: false,
                side: THREE.DoubleSide,
            })
        )
        scene.add(ring)
        const centroid = (ri: number) => {
            const R = REGIONS[ri]
            if (R) {
                return new THREE.Vector3(R.cx, Math.max(0, heightAt(R.cx, R.cz)), R.cz)
            }
            const ps = allPins.current[ri] || []
            if (ps.length > 0) {
                let x = 0, z = 0
                ps.forEach((p) => { x += p.x; z += p.z })
                x /= ps.length
                z /= ps.length
                return new THREE.Vector3(x, Math.max(0, heightAt(x, z)), z)
            }
            return new THREE.Vector3(0, 0, 0)
        }
        const buildArc = (a: number, b: number) => {
            const key = a + ">" + b
            if (key === arcKey && arc) return
            arcKey = key
            if (arc) {
                scene.remove(arc)
                arc.geometry.dispose()
            }
            const A = centroid(a),
                B = centroid(b),
                M = A.clone().lerp(B, 0.5)
            // Yerden çıkıp havada yüksek yarım daire kavis çizen rota yayı
            M.y = Math.max(A.y, B.y) + 1.2
            const curve = new THREE.QuadraticBezierCurve3(A, M, B)
            arc = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 120, 0.012, 8, false),
                arcMat
            )
            ;(arc as any).curve = curve
            scene.add(arc)
        }

        // post: tilt-shift (two-pass variable blur)
        const rtA = new THREE.WebGLRenderTarget(4, 4, {
            samples: 4,
            type: THREE.HalfFloatType,
        })
        const rtB = new THREE.WebGLRenderTarget(4, 4, {
            type: THREE.HalfFloatType,
        })
        const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const blurMat = new THREE.ShaderMaterial({
            uniforms: {
                tex: { value: null },
                dir: { value: new THREE.Vector2(1, 0) },
                px: { value: new THREE.Vector2(1, 1) },
                focus: { value: 0.36 },
                band: { value: 0.2 },
                amt: { value: 1 },
            },
            vertexShader:
                "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
            fragmentShader: `uniform sampler2D tex; uniform vec2 dir; uniform vec2 px; uniform float focus; uniform float band; uniform float amt; varying vec2 vUv;
              void main(){ float d = max(0.0, abs(vUv.y - focus) - band); float r = clamp(d * 3.2, 0.0, 1.0) * 7.0 * amt;
                vec4 acc = vec4(0.0); float wsum = 0.0;
                for (int i = -6; i <= 6; i++) { float fi = float(i); float w = exp(-fi*fi/18.0); acc += texture2D(tex, vUv + dir * px * fi * r / 6.0) * w; wsum += w; }
                gl_FragColor = acc / wsum; }`,
            depthTest: false,
            depthWrite: false,
        })
        const fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat)
        const fsScene = new THREE.Scene()
        fsScene.add(fsQuad)
        const outMat = new THREE.ShaderMaterial({
            uniforms: { tex: { value: null } },
            vertexShader:
                "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
            fragmentShader:
                "uniform sampler2D tex; varying vec2 vUv;\nvoid main(){ gl_FragColor = texture2D(tex, vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
            depthTest: false,
            depthWrite: false,
        })

        let W = 1,
            Hh = 1,
            SB = 470,
            CH = 340
        const resize = () => {
            const r = root.getBoundingClientRect()
            if (r.width < 2 || r.height < 2) return false
            W = Math.round(r.width)
            Hh = Math.round(r.height)
            renderer.setSize(W, Hh, false)
            const pr = renderer.getPixelRatio()
            rtA.setSize(W * pr, Hh * pr)
            rtB.setSize(W * pr, Hh * pr)
            const nar = W < 700
            if (nar !== narrowRef.current) {
                narrowRef.current = nar
                setNarrow(nar)
            }
            setMid(W < 1000)
            camera.aspect = W / Hh
            // Mobilde dikey eksende modelin ferah görünmesi ve menü/arama altına sıkışmaması için offset ve FOV ayarı
            if (nar) {
                camera.fov = 34
                camera.setViewOffset(W, Hh, 0, -Hh * 0.08, W, Hh)
            } else {
                camera.fov = 30
                camera.setViewOffset(W, Hh, 0, -Hh * 0.25, W, Hh)
            }
            camera.updateProjectionMatrix()
            blurMat.uniforms.px.value.set(1 / (W * pr), 1 / (Hh * pr))
            const ui0 = uiRef.current
            SB =
                W < 700
                    ? 0.125 * Hh + 104 + 122
                    : 0.125 * Hh + clamp(0.26 * W, 250, 300) + 62
            if (ui0.searchWrap) {
                const sr = ui0.searchWrap.getBoundingClientRect()
                if (sr.height > 20) SB = Math.max(SB, sr.bottom - r.top)
            }
            if (ui0.card) CH = ui0.card.offsetHeight || 340
            return true
        }

        const proj = new THREE.Vector3()
        let lastGrowth = -1
        const placeInstances = (growth: number, hsc: number) => {
            if (Math.abs(growth - lastGrowth) < 1e-4 && growth >= 1) return
            lastGrowth = growth
            hs.forEach((o, i) => {
                const y = heightAt(o.x, o.z) * hsc
                const k = eBack(
                    clamp(growth * 1.4 - hash(o.x * 9, o.z * 9) * 0.4)
                )
                q.setFromEuler(eul.set(0, o.r, 0))
                v3.set(o.x, y - 0.004, o.z)
                sv.set(o.w, Math.max(0.0001, o.h * k), o.d)
                houses.setMatrixAt(i, m4.compose(v3, q, sv))
                v3.set(o.x, y - 0.004 + o.h * k, o.z)
                sv.set(o.w * 1.02, Math.max(0.0001, k), o.d * 1.02)
                roofs.setMatrixAt(i, m4.compose(v3, q, sv))
            })
            houses.instanceMatrix.needsUpdate = true
            roofs.instanceMatrix.needsUpdate = true
            trees.forEach((tr, i) => {
                const y = heightAt(tr.x, tr.z) * hsc
                const k = eOut(
                    clamp(growth * 1.3 - hash(tr.x * 5, tr.z * 5) * 0.3)
                )
                v3.set(tr.x, y - 0.003, tr.z)
                sv.setScalar(Math.max(0.0001, tr.s * k))
                treeMesh.setMatrixAt(i, m4.compose(v3, q.identity(), sv))
            })
            treeMesh.instanceMatrix.needsUpdate = true
            road.scale.y = hsc
            taxiMesh.visible = growth > 0.4
        }

        const camTarget = new THREE.Vector3(),
            camPos = new THREE.Vector3()
        const regionCam = (
            ri: number,
            drift: number,
            out: any,
            tgt: any,
            mx: number,
            my: number
        ) => {
            const R = REGIONS[ri]
            const ax = R ? R.cx : 0
            const az = R ? R.cz : 0
            const hy = Math.max(0, heightAt(ax, az))
            tgt.set(ax, hy * 0.6, az - 0.05)
            const yaw = (R ? R.yaw : 0) + drift * 0.012 + mx * 0.06,
                pitch = 0.74 + my * 0.03
            // Mobilde (narrowRef.current) ekran dikey ve dar olduğu için çok yakın görünüyordu.
            // dist çarpanını 1.85'e çıkararak kamerayı geriye çektik (daha geniş açı ve ferah görünüm)
            const mobileDistFactor = narrowRef.current ? 1.85 : 1.0
            const dist = 5.0 * (R ? R.dist : 1) * zoomCur * mobileDistFactor
            out.set(
                tgt.x + Math.sin(yaw) * Math.cos(pitch) * dist,
                tgt.y + Math.sin(pitch) * dist,
                tgt.z + Math.cos(yaw) * Math.cos(pitch) * dist
            )
        }
        const pA = new THREE.Vector3(),
            pB = new THREE.Vector3(),
            tA = new THREE.Vector3(),
            tB = new THREE.Vector3()
        let zoomCur = 1
        let mouse = { x: 0, y: 0, sx: 0, sy: 0 }

        const ui = uiRef.current
        const setText = (el: any, s: string) => {
            if (el && el.__t !== s) {
                el.textContent = s
                el.__t = s
            }
        }

        const render = (t: number, mx?: number, my?: number) => {
            if (W < 2 && !resize()) return
            if (mx !== undefined) {
                mouse.sx = mx
                mouse.sy = my || 0
            }
            const now = performance.now() / 1000
            const US = userRef.current
            let TL: any
            if (US.active) {
                const u = now - US.flyT,
                    same = US.prev === US.region
                const nights = US.to && US.to > US.from ? US.to - US.from : 0
                TL = {
                    intro: 1,
                    r: US.region,
                    prev: US.prev,
                    u: same ? 9 : u,
                    fly: same ? 1 : eInOut(seg(u, 0, 1.1)),
                    typing: 1,
                    sinkOld: same ? 1 : seg(u, 0, 0.35),
                    rise: same ? 1 : seg(u, 0.9, 1.9),
                    cal: US.calOpen ? 1 : 0,
                    range: nights > 0 ? 1 : 0,
                    total: nights > 0 ? 1 : 0,
                    nights,
                    guests: US.guests,
                    filter: eOut(seg(now - US.changeT, 0, 0.45)),
                    lift: US.cardClosed
                        ? 0
                        : Math.min(
                              same ? 1 : eOut(seg(u, 1.6, 2.1)),
                              eOut(seg(now - US.cardT, 0, 0.45))
                          ),
                    card: US.cardClosed
                        ? 0
                        : Math.min(
                              same ? 1 : eOut(seg(u, 1.8, 2.4)),
                              eOut(seg(now - US.cardT, 0, 0.5))
                          ),
                    drift: Math.min(u, 40),
                    bump: Math.sin(seg(now - US.changeT, 0, 0.35) * Math.PI),
                }
            } else {
                TL = timeline(t)
                TL.nights = NIGHTS
                TL.guests = TL.guests > 0.5 ? 4 : 2
                TL.bump = 0
                lastAuto.current = TL.r
            }
            const hsc = 0.08 + 0.92 * TL.intro
            if (terrainMat.userData.sh)
                terrainMat.userData.sh.uniforms.uHS.value = hsc
            const p = geo.attributes.position
            if ((geo as any).__hs !== hsc) {
                for (let i = 0; i < p.count; i++) p.setY(i, H0[i] * hsc)
                p.needsUpdate = true
                geo.computeVertexNormals()
                ;(geo as any).__hs = hsc
            }
            placeInstances(TL.intro, hsc)
            zoomCur +=
                ((US.zoom || 1) - zoomCur) * (previewTime >= 0 ? 1 : 0.08)
            // Caddelerde ilerleyen sarı taksiler
            taxis.forEach((tx, i) => {
                const posVal =
                    (((tx.offset + t * tx.speed * tx.dir + 4.5) % 9.0 + 9.0) %
                        9.0) -
                    4.5
                let x = 0,
                    z = 0,
                    ang = 0
                if (tx.axis === "x") {
                    x = posVal
                    z = tx.line + (tx.dir > 0 ? 0.022 : -0.022)
                    ang = tx.dir > 0 ? 0 : Math.PI
                } else if (tx.axis === "z") {
                    x = tx.line + (tx.dir > 0 ? -0.022 : 0.022)
                    z = posVal
                    ang = tx.dir > 0 ? -Math.PI / 2 : Math.PI / 2
                } else {
                    x = posVal
                    z = 0.35 * x + 0.18 + (tx.dir > 0 ? 0.024 : -0.024)
                    ang = -Math.atan(0.35) + (tx.dir > 0 ? 0 : Math.PI)
                }
                const ty = heightAt(x, z) * hsc
                q.setFromEuler(eul.set(0, ang, 0))
                taxiMesh.setMatrixAt(
                    i,
                    m4.compose(v3.set(x, ty, z), q, sv.set(1, 1, 1))
                )
            })
            taxiMesh.instanceMatrix.needsUpdate = true
            // camera
            regionCam(TL.r, TL.drift, pB, tB, mouse.sx, mouse.sy)
            regionCam(TL.prev, CYCLE, pA, tA, mouse.sx, mouse.sy)
            const f = TL.fly
            camTarget.lerpVectors(tA, tB, f)
            camPos.lerpVectors(pA, pB, f)
            camPos.y += Math.sin(f * Math.PI) * 0.9 // lift during the flight
            const introPull = 1 + (1 - TL.intro) * 0.35
            camPos.sub(camTarget).multiplyScalar(introPull).add(camTarget)
            camera.position.copy(camPos)
            camera.lookAt(camTarget)
            camera.updateMatrixWorld(true)
            sun.position.set(
                camTarget.x - 3.4,
                camTarget.y + 3.0,
                camTarget.z - 0.6
            )
            sun.target.position.copy(camTarget)
            sun.target.updateMatrixWorld()
            // route arc (Mavi rota yayı: yerden çıkıp yarım daire çizerek varış noktasına uzanan animasyon)
            if (
                TL.r !== TL.prev &&
                TL.u < 3.2 &&
                (US.active || t >= INTRO)
            ) {
                buildArc(TL.prev, TL.r)
                const grow = eInOut(seg(TL.u, 0, 1.3)),
                    fade = 1 - seg(TL.u, 2.2, 3.2)
                const idx = arc.geometry.index.count
                arc.geometry.setDrawRange(0, Math.floor((idx * grow) / 6) * 6)
                arc.visible = true
                arcMat.opacity = Math.max(0, 0.95 * fade)
                const pt = arc.curve.getPoint(clamp(grow))
                pt.y *= hsc
                dot.position.copy(pt)
                dot.visible = fade > 0.02
                dotMat.opacity = fade
                const B = centroid(TL.r)
                ring.position.set(B.x, B.y * hsc + 0.003, B.z)
                const rp = seg(TL.u, 1.1, 2.8)
                ring.scale.setScalar(1 + rp * 9)
                ;(ring.material as any).opacity =
                    (1 - rp) * 0.9 * (grow > 0.95 ? 1 : 0)
                ring.visible = true
            } else {
                if (arc) arc.visible = false
                dot.visible = false
                ring.visible = false
            }
            // which pin is selected: the user's pick, or the best real stay that fits the party
            const R = REGIONS[TL.r]
            const curPins = allPins.current[TL.r]
            let selIdx =
                US.active && US.selKey && US.selKey.startsWith(TL.r + "-")
                    ? Number(US.selKey.split("-")[1])
                    : -1
            if (selIdx < 0 || !curPins[selIdx]) {
                selIdx = curPins.findIndex(
                    (pp) => pp.sel && pp.cap >= TL.guests
                )
                if (selIdx < 0)
                    selIdx = curPins.findIndex(
                        (pp) => pp.stay && pp.cap >= TL.guests
                    )
                if (selIdx < 0) {
                    let mc = -1
                    curPins.forEach((pp, k) => {
                        if (pp.stay && pp.cap > mc) {
                            mc = pp.cap
                            selIdx = k
                        }
                    })
                }
            }
            const nights = TL.nights || 0
            if (ui.card && ui.card.offsetHeight > 40)
                CH = ui.card.offsetHeight
            let di = 0
            allPins.current.forEach((pins, ri) =>
                pins.forEach((pin, pi) => {
                    const cur = ri === TL.r,
                        old = ri === TL.prev && TL.r !== TL.prev
                    let vis = 0
                    if (cur) vis = eBack(clamp(TL.rise * 1.6 - pi * 0.07))
                    if (old) vis = 1 - TL.sinkOld
                    const fits = pin.cap >= TL.guests
                    if (cur && !fits) vis *= 1 - TL.filter
                    const gy = heightAt(pin.x, pin.z) * hsc
                    const isSel = cur && pi === selIdx
                    v3.set(pin.x, gy + 0.001, pin.z)
                    const ds = 0.028 * vis * (isSel ? 1 + TL.lift * 0.5 : 1)
                    discs.setMatrixAt(
                        di++,
                        m4.compose(
                            v3,
                            q.identity(),
                            sv.set(
                                Math.max(ds, 0.0001),
                                1,
                                Math.max(ds, 0.0001)
                            )
                        )
                    )
                    const el = ui.pins && ui.pins[ri] && ui.pins[ri][pi]
                    if (!el) return
                    if (vis < 0.01) {
                        if (el.style.display !== "none")
                            el.style.display = "none"
                        return
                    }
                    const lift = isSel ? TL.lift : 0
                    proj.set(pin.x, gy, pin.z).project(camera)
                    const gx = (proj.x * 0.5 + 0.5) * W,
                        gyy = (-proj.y * 0.5 + 0.5) * Hh
                    vis *= seg(gyy, SB + 58, SB + 96)
                    if (narrowRef.current && ui.card && TL.card > 0.5)
                        vis *= 1 - seg(gyy, Hh - CH - 40, Hh - CH - 10)
                    if (vis < 0.01) {
                        el.style.display = "none"
                        return
                    }
                    const stem = (30 + lift * 26) * vis
                    el.style.display = "block"
                    el.style.transform = `translate3d(${gx.toFixed(1)}px, ${gyy.toFixed(1)}px, 0)`
                    el.style.opacity = String(clamp(vis * 1.4))
                    el.style.zIndex = String(
                        Math.round(1000 - proj.z * 500) + (isSel ? 400 : 0)
                    )
                    const pill = el.firstChild as HTMLElement,
                        stemEl = el.children[1] as HTMLElement
                    stemEl.style.height = stem.toFixed(1) + "px"
                    pill.style.transform = `translate(-50%, ${(-stem - 30).toFixed(1)}px) scale(${(0.6 + 0.4 * vis + lift * 0.08 + (cur ? TL.bump * 0.08 : 0)).toFixed(3)})`
                    const sel = isSel && lift > 0.5
                    if (pill.dataset.sel !== String(sel)) {
                        pill.dataset.sel = String(sel)
                        pill.style.background = sel ? C.accent : "#fff"
                        pill.style.color = sel ? "#fff" : C.ink
                        const im = pill.children[2] as HTMLElement
                        if (im) {
                            im.style.width = sel ? "20px" : "0px"
                            im.style.marginLeft = sel ? "3px" : "0px"
                            im.style.transition = previewTime >= 0 ? "none" : ""
                        }
                    }
                    setText(pill.children[0], fmt(pin.base))
                    setText(
                        pill.children[1],
                        pin.stay && pin.stay.eta ? `~${pin.stay.eta}` : "~3 dk"
                    )
                    el.dataset.key = ri + "-" + pi
                })
            )
            discs.instanceMatrix.needsUpdate = true
            // search UI: inputlar boş kalır, kullanıcı kendisi yazar (placeholder görünür)
            if (ui.caret) ui.caret.style.opacity = "0"
            const from = US.active ? US.from : 12
            const endDay = US.active
                ? US.to || 0
                : 12 + Math.round(NIGHTS * TL.range)
            setText(
                ui.when,
                (US.active ? US.to : TL.range > 0)
                    ? US.active
                        ? `${from} Eki · Planlı`
                        : "Şimdi · ~3 dk"
                    : US.active
                      ? "Saat / gün seçin"
                      : "Hemen şimdi"
            )
            if (ui.when)
                ui.when.style.color = (US.active ? !!US.to : TL.range > 0)
                    ? C.ink
                    : C.ink2
            setText(
                ui.who,
                `${TL.guests} yolcu`
            )
            if (ui.whoBump)
                ui.whoBump.style.transform = US.active
                    ? `scale(${1 + TL.bump * 0.1})`
                    : `scale(${1 + Math.sin(seg(TL.u, 3.5, 3.7) * Math.PI) * 0.12})`
            if (ui.cal) {
                const cv = US.active ? (US.calOpen ? 1 : 0) : TL.cal
                ui.cal.style.opacity = String(cv)
                ui.cal.style.transform = `translateY(${(1 - eOut(cv)) * -10}px) scale(${0.97 + 0.03 * eOut(cv)})`
                ui.cal.style.visibility = cv > 0.01 ? "visible" : "hidden"
                ui.cal.style.pointerEvents =
                    US.active && US.calOpen ? "auto" : "none"
                ;(ui.days || []).forEach((d: HTMLElement, i: number) => {
                    const day = i + 1,
                        has = US.active ? !!US.to : TL.range > 0
                    const inR = has && day >= from && day <= endDay,
                        edge = day === from || (has && day === endDay)
                    const k = edge ? "e" : inR ? "r" : "n"
                    if (d.dataset.k !== k) {
                        d.dataset.k = k
                        d.style.background = edge
                            ? C.ink
                            : inR
                              ? "rgba(58,58,244,0.10)"
                              : "transparent"
                        d.style.color = edge ? "#fff" : C.ink
                    }
                })
            }
            setText(ui.region, `${R.name} · ${R.kind}`)
            setText(ui.coord, R.coord)
            const shown = curPins.filter(
                (pp) => pp.cap >= TL.guests || TL.filter < 0.5
            ).length
            setText(
                ui.count,
                `${Math.round(R.homes * (TL.guests >= 4 ? 0.62 : TL.guests >= 3 ? 0.8 : 1))} homes · ${shown} in view`
            )
            setText(
                ui.avg,
                nights > 0 && (US.active || TL.total > 0.5)
                    ? `avg ${fmt(R.avg * nights)} for ${nights} nights`
                    : `avg ${fmt(R.avg)} a night`
            )
            // card: the selected pin's stay
            const stList = (HDATA.stays as any[]).filter((st) => st.place === R.name)
            const st = stList[0] || HDATA.stays[0]
            if (ui.card) {
                const c = TL.card
                const narrow = narrowRef.current
                const isCompact = narrow || W < 1000
                const pinX = R.cx, pinZ = R.cz
                proj.set(pinX, heightAt(pinX, pinZ) * hsc, pinZ).project(camera)
                const gx = (proj.x * 0.5 + 0.5) * W,
                    gy = (-proj.y * 0.5 + 0.5) * Hh
                const cw = narrow
                    ? Math.min(W - 24, 320)
                    : isCompact
                        ? Math.min(W - 32, 310)
                        : Math.min(256, Math.round(W * 0.22))
                // Mobilde ortalanmış, yarım ekran ve bilgisayarda sağ altta
                const cx = narrow
                    ? Math.max(12, (W - cw) / 2)
                    : W - cw - 20
                
                ui.card.style.width = cw + "px"
                const actualH = ui.card.offsetHeight > 40 ? ui.card.offsetHeight : CH
                CH = actualH
                const visH = narrow
                    ? Math.min(Hh, window.visualViewport?.height || window.innerHeight || Hh)
                    : Hh
                const bottomPad = narrow ? 38 : 20
                const cy = Math.max(72, visH - actualH - bottomPad)
                const inputFocused =
                    document.activeElement === ui.fromInput ||
                    document.activeElement === ui.whereInput
                const showCard = c > 0.005 && !inputFocused && !US.cardClosed
                ui.card.style.visibility = showCard ? "visible" : "hidden"
                ui.card.style.opacity = showCard ? String(clamp(c * 1.2)) : "0"
                ui.card.style.pointerEvents = showCard ? "auto" : "none"
                ui.card.style.transform = `translate3d(${cx.toFixed(1)}px, ${(cy + (1 - c) * 28).toFixed(1)}px, 0)`
                ui.card.style.transformOrigin = "50% 50%"
                ui.card.style.clipPath = "none"
                const img = st
                    ? U(st.img, 700)
                    : U(HDATA.places[TL.r].photo, 700)
                if (ui.cardImg && ui.cardImg.dataset.src !== img) {
                    ui.cardImg.dataset.src = img
                    ui.cardImg.src = img
                }
                if (ui.cardImg)
                    ui.cardImg.style.transform = `scale(${(1.12 - 0.12 * c).toFixed(3)})`
                const fromName =
                    (ui.fromInput && ui.fromInput.value) ||
                    (REGIONS[TL.prev] ? REGIONS[TL.prev].name : "Çarşı")
                setText(
                    ui.cTitle,
                    st ? st.title : `${R.name} · ${fromName}'den`
                )
                setText(
                    ui.cMeta,
                    st ? stayMeta(st) : "Sarı Taksi · 4 kişilik"
                )
                setText(
                    ui.cRate,
                    st
                        ? `${st.rating} · En yakın taksi (${st.eta || "3 dk"})`
                        : "4.95 · Müsait taksi (~3 dk)"
                )
                setText(ui.cHost, st ? stayHost(st) : "Elazığ Merkez Taksi Durağı")
                setText(ui.cTag, st ? st.tag : "Hızlı Taksi")
                setText(ui.cPrice, fmt(st ? st.price : R.avg))
                setText(
                    ui.cNight,
                    st && st.fromText
                        ? st.fromText
                        : `${fromName} → ${R.name}`
                )
                ui.card.setAttribute(
                    "href",
                    st
                        ? "/stays/" + st.slug
                        : `${searchLink}?where=${encodeURIComponent(R.name)}`
                )
            }
            // render: mobilde doğrudan ekrana basarak 3 aşamalı ağır tilt-shift blur shader döngüsünü pas geçiyoruz
            if (isMobileDevice) {
                renderer.setRenderTarget(null)
                renderer.render(scene, camera)
            } else {
                // PC / Masaüstünde tilt-shift post-processing
                renderer.setRenderTarget(rtA)
                renderer.render(scene, camera)
                blurMat.uniforms.amt.value = 0.55 + 0.45 * TL.intro
                blurMat.uniforms.focus.value = 0.33
                blurMat.uniforms.band.value = 0.2
                blurMat.uniforms.tex.value = rtA.texture
                blurMat.uniforms.dir.value.set(1, 0)
                renderer.setRenderTarget(rtB)
                renderer.render(fsScene, fsCam)
                blurMat.uniforms.tex.value = rtB.texture
                blurMat.uniforms.dir.value.set(0, 1)
                fsQuad.material = blurMat
                renderer.setRenderTarget(rtA)
                renderer.render(fsScene, fsCam)
                fsQuad.material = outMat
                outMat.uniforms.tex.value = rtA.texture
                renderer.setRenderTarget(null)
                renderer.render(fsScene, fsCam)
                fsQuad.material = blurMat
            }
        }
        // NB rtA reused as the V-blur target; it's resolved from MSAA before sampling.

        ;(HDATA.stays as any[]).forEach((st) => {
            const im = new Image()
            im.src = U(st.img, 700)
        })
        resize()
        const g0: any = ((window as any).__staysift =
            (window as any).__staysift || {})
        const start = previewTime >= 0 ? previewTime : isStatic ? 6.2 : 0
        render(start)
        let raf = 0,
            alive = true,
            t0 = performance.now() - start * 1000,
            lastFrame = 0
        const reduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const loop = () => {
            if (!alive) return
            raf = requestAnimationFrame(loop)
            // Modal açıkken, sekme gizliyken veya aşağı kaydırılmışken 3D WebGL çizimini durdur (0% CPU/GPU tüketimi)
            if (document.hidden || modalOpenRef.current || window.scrollY > window.innerHeight * 0.85) {
                return
            }
            const now = performance.now()
            // Mobilde 30 FPS sınırı ile işlemci ve pil yükünü yarıya indir
            if (isMobileDevice && now - lastFrame < 33) {
                return
            }
            lastFrame = now
            mouse.x += (mouse.sx - mouse.x) * 0.06
            render((now - t0) / 1000, mouse.x, mouse.y)
        }
        g0.hero = {
            render: (tt: number, mx = 0, my = 0) => {
                cancelAnimationFrame(raf)
                mouse.x = mx
                mouse.y = my
                render(tt, mx, my)
            },
            live: () => {
                t0 = performance.now()
                loop()
            },
            pins: allPins.current,
            cam: camera,
        }
        const onMove = (e: PointerEvent) => {
            const r = root.getBoundingClientRect()
            mouse.sx = ((e.clientX - r.left) / r.width - 0.5) * 2
            mouse.sy = ((e.clientY - r.top) / r.height - 0.5) * 2
            mouse.y += (mouse.sy - mouse.y) * 0.1
        }
        root.addEventListener("pointermove", onMove)
        const ro = new ResizeObserver(() => {
            if (resize())
                render(
                    previewTime >= 0 || isStatic || reduce
                        ? start
                        : (performance.now() - t0) / 1000
                )
        })
        ro.observe(root)
        if (previewTime < 0 && !isStatic && !reduce)
            raf = requestAnimationFrame(loop)
        else if (reduce && previewTime < 0 && !isStatic) render(6.2)
        return () => {
            alive = false
            cancelAnimationFrame(raf)
            ro.disconnect()
            root.removeEventListener("pointermove", onMove)
            renderer.dispose()
            rtA.dispose()
            rtB.dispose()
            geo.dispose()
        }
    }, [previewTime, isStatic])

    const ui = uiRef.current
    const glass: React.CSSProperties = {
        background: C.glass,
        backdropFilter: "blur(18px) saturate(1.3)",
        WebkitBackdropFilter: "blur(18px) saturate(1.3)",
        border: `1px solid rgba(255,255,255,0.7)`,
        boxShadow:
            "0 1px 0 rgba(255,255,255,0.8) inset, 0 12px 40px -12px rgba(30,28,20,0.22), 0 0 0 1px rgba(16,17,20,0.06)",
    }
    const lines = headline.split("\n")
    return (
        <div
            ref={rootRef}
            style={{
                ...props.style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: C.bg,
                fontFamily: SANS,
                color: C.ink,
                userSelect: "none",
            }}
        >
            <style>{`
              .ss-pill{transition:box-shadow .25s cubic-bezier(.2,.8,.2,1), filter .25s}
              .ss-pin:hover .ss-pill{box-shadow:0 0 0 2px ${C.ink}, 0 10px 24px -8px rgba(0,0,0,.35)!important}
              .ss-btn{transition:transform .35s cubic-bezier(.2,.8,.2,1), background .25s}
              .ss-btn:hover{transform:scale(1.05)} .ss-btn:active{transform:scale(.96)}
              .ss-btn:focus-visible,.ss-field:focus-visible,.ss-link:focus-visible,.ss-focus:focus-visible{outline:2px solid ${C.accent};outline-offset:3px}
              .ss-field{transition:background .25s} .ss-field:hover{background:rgba(16,17,20,0.045)}
              .ss-link,.ss-focus{color:${C.ink};text-decoration:none;opacity:.92;transition:opacity .2s} .ss-link:hover,.ss-focus:hover{opacity:1}

              /* Nicholson Design td-b interactive glass component styles */
              .td-modal-card {
                position: relative;
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 20px;
                border-radius: 22px;
                text-decoration: none;
                background: rgba(255, 255, 255, 0.72);
                backdrop-filter: blur(28px) saturate(180%);
                -webkit-backdrop-filter: blur(28px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.85);
                box-shadow: 0 32px 80px -16px rgba(16, 17, 24, 0.28), 0 0 0 1px rgba(16, 17, 20, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.9);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                color: #101114;
                overflow: hidden;
              }
              .td-modal-card:hover {
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(58, 58, 244, 0.35);
                transform: translateY(-2px);
                box-shadow: 0 36px 90px -12px rgba(58, 58, 244, 0.2), 0 0 0 1px rgba(58, 58, 244, 0.25), inset 0 1px 1px #fff;
              }
              .td-modal-card .td-glass {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 100%);
                pointer-events: none;
                border-radius: inherit;
              }
              .td-modal-card .td-sheen {
                position: absolute;
                top: 0;
                left: -120%;
                width: 70%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
                transform: skewX(-22deg);
                transition: left 0.75s ease;
                pointer-events: none;
              }
              .td-modal-card:hover .td-sheen {
                left: 170%;
              }
              .td-modal-card .td-hl {
                position: absolute;
                top: 0;
                left: 10%;
                right: 10%;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
                pointer-events: none;
              }
              .td-modal-card .td-ic {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: rgba(58, 58, 244, 0.1);
                color: #3A3AF4;
                display: grid;
                place-items: center;
                flex: none;
                box-shadow: inset 0 1px 1px rgba(255,255,255,0.9);
                transition: transform 0.25s ease, background 0.25s ease;
              }
              .td-modal-card:hover .td-ic {
                transform: scale(1.08);
                background: rgba(58, 58, 244, 0.16);
              }
              .td-b {
                position: relative;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 18px;
                text-decoration: none;
                background: rgba(246, 246, 248, 0.72);
                backdrop-filter: blur(28px) saturate(180%);
                -webkit-backdrop-filter: blur(28px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.85);
                box-shadow: 0 16px 40px -10px rgba(16, 17, 24, 0.12), 0 0 0 1px rgba(16, 17, 20, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.95);
                cursor: pointer;
                transition: all 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
                color: #101114;
                overflow: hidden;
              }
              .td-b:hover {
                background: rgba(250, 250, 252, 0.92);
                border-color: rgba(58, 58, 244, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 24px 50px -10px rgba(58, 58, 244, 0.16), 0 0 0 1px rgba(58, 58, 244, 0.2), inset 0 1px 1px #fff;
              }
              .td-b.active {
                background: #ffffff;
                border-color: #3A3AF4;
                box-shadow: 0 8px 24px -4px rgba(58, 58, 244, 0.25), 0 0 0 1.5px #3A3AF4, inset 0 1px 0 #fff;
              }
              .td-b .td-glass {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%);
                pointer-events: none;
                border-radius: inherit;
              }
              .td-b .td-sheen {
                position: absolute;
                top: 0;
                left: -120%;
                width: 70%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
                transform: skewX(-22deg);
                transition: left 0.7s ease;
                pointer-events: none;
              }
              .td-b:hover .td-sheen {
                left: 170%;
              }
              .td-b .td-hl {
                position: absolute;
                top: 0;
                left: 12%;
                right: 12%;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
                pointer-events: none;
              }
              .td-b .td-ic {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: rgba(58, 58, 244, 0.08);
                color: #3A3AF4;
                display: grid;
                place-items: center;
                flex: none;
                box-shadow: inset 0 1px 1px rgba(255,255,255,0.8);
                transition: transform 0.25s ease, background 0.25s ease;
              }
              .td-b:hover .td-ic {
                transform: scale(1.06);
                background: rgba(58, 58, 244, 0.14);
              }
              .td-b .td-lbl {
                flex: 1;
                display: flex;
                flex-direction: column;
                text-align: left;
              }
              .td-aa-col {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .td-aa-row {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .td-t {
                font-size: 14.5px;
                font-weight: 700;
                color: #101114;
                letter-spacing: -0.015em;
              }
              .td-aa-row s {
                font-size: 12px;
                color: #8E9099;
                text-decoration: line-through;
              }
              .td-price {
                font-size: 14.5px;
                font-weight: 800;
                color: #3A3AF4;
                font-family: 'JetBrains Mono', monospace;
              }
              .td-lbl small {
                font-size: 11.5px;
                color: #55575E;
                font-weight: 500;
              }
              .td-call-btn {
                position: relative;
                isolation: isolate;
                overflow: hidden;
                height: 48px;
                padding: 0 22px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: none;
                margin-left: 4px;
                cursor: pointer;
                font-family: ${SANS};
                font-weight: 700;
                font-size: 14px;
                letter-spacing: -0.015em;
                color: #0F172A;
                background: linear-gradient(155deg, rgba(226, 238, 255, 0.62) 0%, rgba(190, 215, 255, 0.38) 52%, rgba(155, 192, 255, 0.28) 100%);
                backdrop-filter: blur(32px) saturate(195%);
                -webkit-backdrop-filter: blur(32px) saturate(195%);
                border: 1px solid rgba(255, 255, 255, 0.88);
                box-shadow:
                  0 18px 40px -12px rgba(58, 108, 244, 0.26),
                  0 4px 12px -4px rgba(16, 17, 24, 0.08),
                  0 0 0 1px rgba(96, 148, 255, 0.22),
                  inset 0 1px 1px rgba(255, 255, 255, 0.96),
                  inset 0 -1px 0 rgba(185, 212, 255, 0.45);
                transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
              }
              .td-call-btn:hover {
                background: linear-gradient(155deg, rgba(232, 242, 255, 0.76) 0%, rgba(196, 220, 255, 0.52) 100%);
                border-color: rgba(96, 148, 255, 0.45);
                transform: translateY(-1.5px) scale(1.02);
                box-shadow:
                  0 22px 48px -10px rgba(58, 108, 244, 0.34),
                  0 0 0 1px rgba(96, 148, 255, 0.32),
                  inset 0 1px 1px #fff;
              }
              .td-call-btn:active {
                transform: scale(0.97);
              }
              .td-call-btn > .td-glass {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(195,220,255,0.10) 58%, rgba(88,140,255,0.14) 100%);
                pointer-events: none;
                border-radius: inherit;
              }
              .td-call-btn > .td-sheen,
              .td-em > .td-sheen {
                position: absolute;
                top: 0;
                left: -130%;
                width: 75%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.82), transparent);
                transform: skewX(-22deg);
                transition: left 0.72s ease;
                pointer-events: none;
              }
              .td-call-btn:hover > .td-sheen,
              .td-call-btn:hover .td-em > .td-sheen {
                left: 175%;
              }
              .td-call-btn > .td-hl {
                position: absolute;
                top: 0;
                left: 14%;
                right: 14%;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.98), transparent);
                pointer-events: none;
              }
              .td-em {
                position: relative;
                width: 34px;
                height: 34px;
                border-radius: 999px;
                display: grid;
                place-items: center;
                flex: none;
                overflow: hidden;
                color: #3A3AF4;
                background: linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(58,58,244,0.14) 100%);
                border: 1px solid rgba(255,255,255,0.95);
                box-shadow:
                  0 6px 14px -5px rgba(58,58,244,0.35),
                  0 0 0 0.5px rgba(58,58,244,0.18),
                  inset 0 1px 1px #fff;
                transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.28s ease;
              }
              .td-call-btn:hover .td-em {
                transform: scale(1.07);
                background: linear-gradient(155deg, #fff 0%, rgba(58,58,244,0.22) 100%);
              }
              .td-em > .td-glass {
                position: absolute;
                inset: 0;
                background: radial-gradient(110% 90% at 30% 15%, rgba(255,255,255,0.85), rgba(255,255,255,0) 65%);
                pointer-events: none;
                border-radius: inherit;
              }
              .td-em > i {
                width: 17px;
                height: 17px;
                display: block;
                background-color: #3A3AF4;
                -webkit-mask-image: var(--m);
                mask-image: var(--m);
                -webkit-mask-size: contain;
                mask-size: contain;
                -webkit-mask-repeat: no-repeat;
                mask-repeat: no-repeat;
                -webkit-mask-position: center;
                mask-position: center;
                position: relative;
                z-index: 1;
              }

              /* ---------- Taksi Çağır modalı: katmanlı buzlu cam ---------- */
              @keyframes ptFade { from { opacity: 0 } to { opacity: 1 } }
              @keyframes ptIn { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
              @keyframes ptUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: none } }
              @keyframes ptMapExpand {
                0% { opacity: 0; transform: scale(0.66) translateY(-10px); border-radius: 36px; }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
              .pt-map-card {
                transform-origin: 50% 42%;
                animation: ptMapExpand .42s cubic-bezier(0.16, 1, 0.3, 1) both !important;
                will-change: transform, opacity;
              }
              @keyframes ptPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,.55) } 100% { box-shadow: 0 0 0 7px rgba(34,197,94,0) } }
              .pt-overlay {
                position: fixed; inset: 0; z-index: 9999;
                display: flex; align-items: center; justify-content: center; padding: 16px;
                background: radial-gradient(120% 90% at 50% 10%, rgba(241,239,234,0.06), rgba(16,17,20,0.38));
                backdrop-filter: blur(6px) saturate(120%);
                -webkit-backdrop-filter: blur(6px) saturate(120%);
                animation: ptFade .25s ease-out both;
              }
              .pt-card {
                position: relative; isolation: isolate; overflow: hidden;
                width: 100%; max-width: 440px; box-sizing: border-box;
                padding: 22px; border-radius: 30px;
                font-family: ${SANS}; color: ${C.ink};
                background: linear-gradient(155deg, rgba(255,255,255,0.74) 0%, rgba(247,247,250,0.52) 48%, rgba(236,237,243,0.44) 100%);
                backdrop-filter: blur(40px) saturate(190%) brightness(1.04);
                -webkit-backdrop-filter: blur(40px) saturate(190%) brightness(1.04);
                border: 1px solid rgba(255,255,255,0.78);
                box-shadow:
                  0 40px 100px -24px rgba(16,17,24,0.45),
                  0 12px 30px -12px rgba(16,17,24,0.18),
                  0 0 0 0.5px rgba(16,17,20,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.95),
                  inset 0 -1px 0 rgba(255,255,255,0.35);
                animation: ptIn .45s cubic-bezier(.2,.8,.2,1) both;
              }
              /* üst yarıda yumuşak ışık yansıması */
              .pt-card::after {
                content: ""; position: absolute; inset: 0 0 52% 0; z-index: -1; pointer-events: none;
                background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
              }
              /* köşede mavi cam parıltısı */
              .pt-glow {
                position: absolute; z-index: -1; pointer-events: none;
                width: 300px; height: 300px; top: -150px; right: -110px; border-radius: 50%;
                background: radial-gradient(circle, rgba(58,58,244,0.22), rgba(58,58,244,0) 65%);
              }
              .pt-close {
                position: absolute; top: 16px; right: 16px; z-index: 2;
                width: 32px; height: 32px; border-radius: 999px; padding: 0;
                display: grid; place-items: center; cursor: pointer;
                background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.85);
                box-shadow: inset 0 1px 0 #fff, 0 2px 8px rgba(16,17,20,0.08);
                transition: transform .3s cubic-bezier(.2,.8,.2,1), background .2s;
              }
              .pt-close:hover { background: rgba(255,255,255,0.88); transform: rotate(90deg) }
              .pt-ic {
                width: 46px; height: 46px; flex: none; border-radius: 15px;
                display: grid; place-items: center; color: ${C.accent};
                background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(58,58,244,0.10));
                border: 1px solid rgba(255,255,255,0.9);
                box-shadow: inset 0 1px 0 #fff, 0 6px 16px -6px rgba(58,58,244,0.35);
              }
              .pt-ic-ok { width: 56px; height: 56px; border-radius: 999px; color: #16a34a;
                background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(34,197,94,0.16));
                box-shadow: inset 0 1px 0 #fff, 0 10px 24px -8px rgba(34,197,94,0.45); }
              .pt-eyebrow { display: flex; align-items: center; gap: 7px; font-family: ${MONO}; font-size: 11px; color: ${C.ink2}; letter-spacing: 0.01em; }
              .pt-live { width: 7px; height: 7px; border-radius: 99px; background: #22c55e; flex: none; animation: ptPulse 1.6s ease-out infinite; }
              .pt-tile {
                display: block; border-radius: 18px;
                background: rgba(255,255,255,0.5);
                border: 1px solid rgba(255,255,255,0.88);
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.04), 0 8px 20px -14px rgba(16,17,20,0.18);
              }
              .pt-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6D75; }
              .pt-stop { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
              .pt-place { font-size: 14.5px; font-weight: 600; letter-spacing: -0.015em; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              .pt-dot { width: 10px; height: 10px; flex: none; border-radius: 99px; background: ${C.accent}; box-shadow: 0 0 0 4px rgba(58,58,244,0.14); }
              .pt-dot-end { border-radius: 3px; background: ${C.ink}; box-shadow: 0 0 0 4px rgba(16,17,20,0.08); }
              .pt-link { margin: -6px 0 -6px 4.5px; height: 14px; border-left: 1.5px dashed rgba(16,17,20,0.2); }
              .pt-pill {
                display: inline-flex; align-items: center; gap: 6px; flex: none;
                padding: 7px 8px 7px 12px; border-radius: 999px; font-size: 12.5px; color: ${C.ink};
                background: rgba(58,58,244,0.08); border: 1px solid rgba(58,58,244,0.16);
              }
              .pt-pill b { font-family: ${MONO}; font-weight: 600; color: ${C.accent}; }
              .pt-pill-tag { font-family: ${MONO}; font-size: 11px; font-weight: 700; color: #fff; background: ${C.accent}; padding: 3px 7px; border-radius: 999px; }
              .pt-field { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: text; transition: background .2s, box-shadow .2s, border-color .2s; }
              .pt-field:focus-within { background: rgba(255,255,255,0.82); border-color: rgba(58,58,244,0.35);
                box-shadow: 0 0 0 3px rgba(58,58,244,0.14), inset 0 1px 0 #fff; }
              .pt-input { width: 100%; box-sizing: border-box; border: 0; outline: none; background: transparent; padding: 0; margin-top: 1px;
                font-family: ${SANS}; font-size: 16px; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
              .pt-input::placeholder { color: #A3A5AD; }
              .pt-primary {
                position: relative; overflow: hidden; width: 100%; border: 0; cursor: pointer; text-align: left;
                display: flex; align-items: center; gap: 12px; padding: 14px 14px 14px 18px; border-radius: 18px;
                font-family: ${SANS}; color: #fff;
                background: linear-gradient(180deg, #5050FF 0%, ${C.accent} 55%, #2E2EDC 100%);
                box-shadow: 0 14px 30px -10px rgba(58,58,244,0.6), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15);
                transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s;
              }
              .pt-primary::after {
                content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; pointer-events: none;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
                transform: skewX(-20deg); transition: left .7s ease;
              }
              .pt-primary:hover { transform: translateY(-1px); box-shadow: 0 18px 38px -10px rgba(58,58,244,0.7), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15); }
              .pt-primary:hover::after { left: 130%; }
              .pt-primary:active { transform: scale(.985); }
              .pt-badge { flex: none; font-family: ${MONO}; font-size: 13px; font-weight: 600; padding: 8px 10px; border-radius: 12px;
                background: rgba(255,255,255,0.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3); }
              .pt-ghost {
                width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px;
                padding: 13px 16px; border-radius: 16px; font-family: ${SANS}; font-size: 14px; font-weight: 600; color: ${C.ink};
                background: rgba(255,255,255,0.42); border: 1px solid rgba(255,255,255,0.85);
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.05);
                transition: background .2s, transform .2s;
              }
              .pt-ghost:hover { background: rgba(255,255,255,0.72); }
              .pt-ghost:active { transform: scale(.985); }
              .pt-divider { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #8E9099; }
              .pt-divider::before, .pt-divider::after { content: ""; flex: 1; height: 1px; background: rgba(16,17,20,0.08); }
              .pt-close:focus-visible, .pt-primary:focus-visible, .pt-ghost:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 3px; }
              /* telefonda ekranı ortalayan kompakt kart */
              @media (max-width: 700px) {
                .pt-overlay { align-items: center; padding: 12px; }
                .pt-card { padding: 18px 15px 16px; border-radius: 26px; }
                .pt-pill { padding: 5px 6px 5px 10px; font-size: 11.5px; gap: 5px; }
                .pt-pill-tag { font-size: 10.5px; padding: 2px 6px; }
              }
              @media (prefers-reduced-motion: reduce) {
                .pt-overlay, .pt-card, .pt-live { animation: none; }
              }
            `}</style>
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
            {/* top fade so headline sits on clean ground */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "46%",
                    background: `linear-gradient(${C.bg} 12%, rgba(241,239,234,0.82) 34%, rgba(241,239,234,0.0))`,
                    pointerEvents: "none",
                }}
            />
            {/* pins */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 3,
                }}
            >
                {allPins.current.map((pins, ri) =>
                    pins.map((pin, pi) => (
                        <div
                            key={ri + "-" + pi}
                            className="ss-pin"
                            onClick={() => pickPin(ri + "-" + pi)}
                            ref={(el) => {
                                ui.pins = ui.pins || []
                                ui.pins[ri] = ui.pins[ri] || []
                                ui.pins[ri][pi] = el
                            }}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                display: "none",
                                pointerEvents: "auto",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                className="ss-pill"
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    transformOrigin: "50% 100%",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: 5,
                                    padding: "7px 11px 7px 12px",
                                    borderRadius: 999,
                                    background: "#fff",
                                    color: C.ink,
                                    fontFamily: MONO,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                    boxShadow:
                                        "0 0 0 1px rgba(16,17,20,0.08), 0 8px 20px -8px rgba(30,28,20,0.35)",
                                }}
                            >
                                <span
                                    style={{
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    200 TL
                                </span>
                                <span
                                    style={{
                                        fontSize: 10,
                                        opacity: 0.6,
                                        fontFamily: SANS,
                                        letterSpacing: 0,
                                    }}
                                >
                                    ~3 dk
                                </span>
                                {pin.stay && (
                                    <img
                                        alt=""
                                        src={U(pin.stay.img, 80)}
                                        style={{
                                            width: 0,
                                            height: 20,
                                            borderRadius: 99,
                                            objectFit: "cover",
                                            alignSelf: "center",
                                            marginLeft: 0,
                                            transition:
                                                "width .45s cubic-bezier(.2,.8,.2,1), margin .45s cubic-bezier(.2,.8,.2,1)",
                                        }}
                                    />
                                )}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    left: -0.5,
                                    bottom: 0,
                                    width: 1,
                                    height: 30,
                                    background:
                                        "linear-gradient(rgba(16,17,20,0.7), rgba(16,17,20,0.15))",
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
            {/* nav */}
            {showNav && (
                <div
                    ref={menuWrapRef}
                    style={{
                        position: narrow ? "relative" : "absolute",
                        top: narrow ? 0 : 18,
                        left: narrow ? 0 : 24,
                        right: narrow ? 0 : 24,
                        zIndex: 25,
                    }}
                >
                    <nav
                        aria-label="Main"
                        style={{
                            position: "relative",
                            height: 56,
                            margin: narrow ? "8px 12px 0px" : "0",
                            borderRadius: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0px 10px 0px 16px",
                            background: "rgba(252, 251, 248, 0)",
                            backdropFilter: "none",
                            boxShadow: "none",
                            transition:
                                "background 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        }}
                    >
                        <a
                            href="/"
                            className="ss-focus"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                fontWeight: 600,
                                fontSize: 17,
                                letterSpacing: "-0.03em",
                                color: "#101114",
                                textDecoration: "none",
                            }}
                            aria-label="Paytaksi home"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                {/* Taksi gövde & tavan silüeti */}
                                <rect x="3" y="10" width="18" height="7.5" rx="2.5" fill="none" stroke="#101114" strokeWidth="1.8" />
                                <path d="M6 10L8 5.5h8l2 4.5" fill="none" stroke="#101114" strokeWidth="1.8" strokeLinejoin="round" />
                                {/* Taksi tepe lambası */}
                                <rect x="10" y="3.5" width="4" height="2" rx="0.8" fill="#F5B800" stroke="#101114" strokeWidth="1" />
                                {/* Tekerler / Farlar - ikonik mavi nokta detayı */}
                                <circle cx="7" cy="17.5" r="2.2" fill="#101114" />
                                <circle cx="17" cy="17.5" r="2.2" fill="#101114" />
                                <circle cx="12" cy="12.8" r="1.8" fill="#3A3AF4" />
                            </svg>
                            Paytaksi
                        </a>

                        {!compactNav && (
                            <div
                                className="ss-navlinks"
                                style={{
                                    display: "flex",
                                    gap: 24,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <a
                                    className="ss-link"
                                    href="#tarife"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setTariffModalOpen(true)
                                    }}
                                >
                                    Tarifeler
                                </a>
                                <a
                                    className="ss-link"
                                    href="/bizimle-calisin"
                                >
                                    Bizimle Çalışın
                                </a>
                                <a className="ss-link" href="/hakkimizda">
                                    Hakkımızda
                                </a>
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                flexShrink: 0,
                            }}
                        >
                            {!compactNav && (
                                <>
                                    {authUser ? (
                                        <a
                                            className="ss-btn ss-focus"
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
                                                flex: "none",
                                            }}
                                        >
                                            {userInitial}
                                        </a>
                                    ) : (
                                        <a
                                            className="ss-btn"
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
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Giriş Yap
                                        </a>
                                    )}
                                </>
                            )}
                        {/* Hamburger Menü Butonu: Geniş masaüstünde (compactNav=false) gizlenir; dar ekranda ve telefonda görünür */}
                        {compactNav && authUser && (
                            <a
                                className="ss-btn ss-focus"
                                href="/giris"
                                aria-label="Profil"
                                title={authUser.fullName || authUser.email || "Profil"}
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
                                    boxShadow: "0 4px 12px -4px rgba(16,17,20,0.35)",
                                    flex: "none",
                                }}
                            >
                                {userInitial}
                            </a>
                        )}
                        {compactNav && (
                            <button
                                aria-label="Menüyü Aç"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen((o) => !o)}
                                className="ss-btn ss-focus"
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 999,
                                    border: "0px",
                                    background: menuOpen
                                        ? "rgba(16, 17, 20, 0.12)"
                                        : "rgba(16, 17, 20, 0.06)",
                                    cursor: "pointer",
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                {menuOpen ? (
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        style={{ flex: "0 0 auto", display: "block" }}
                                    >
                                        <path
                                            d="M6 18L18 6M6 6l12 12"
                                            fill="none"
                                            stroke="#101114"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        style={{ flex: "0 0 auto", display: "block" }}
                                    >
                                        <path
                                            d="M4 8h16M4 16h16"
                                            fill="none"
                                            stroke="#101114"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        )}
                        </div>
                    </nav>

                    {/* Mobil & Dar Ekran Açılır Menü (Sağa hizalı kompakt açılır menü) */}
                    {compactNav && menuOpen && (
                        <div
                            aria-hidden="false"
                            style={{
                                position: "absolute",
                                left: "auto",
                                right: narrow ? 12 : 0,
                                top: narrow ? 60 : 58,
                                width: narrow ? "min(232px, calc(100vw - 24px))" : 256,
                                borderRadius: 16,
                                background: "rgba(252, 251, 248, 0.98)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                boxShadow:
                                    "rgba(30, 28, 20, 0.24) 0px 18px 38px -14px, rgba(16, 17, 20, 0.08) 0px 0px 0px 1px",
                                padding: "6px 7px",
                                pointerEvents: "auto",
                                zIndex: 100,
                            }}
                        >
                            {[
                                { title: "Tarifeler", desc: "İndi-bindi & km ücreti", href: "#tarife", action: "tariff" },
                                { title: "Bizimle Çalışın", desc: "Taksici olarak katıl", href: "/bizimle-calisin", action: "partner" },
                                { title: "Hakkımızda", desc: "Paytaksi bilgi", href: "/hakkimizda", action: "about" },
                            ].map((item) => (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    tabIndex={0}
                                    className="ss-focus"
                                    onClick={(e) => {
                                        setMenuOpen(false)
                                        if (item.action === "tariff") {
                                            e.preventDefault()
                                            setTariffModalOpen(true)
                                        }
                                    }}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "8px 10px",
                                        borderRadius: 11,
                                        color: C.ink,
                                        textDecoration: "none",
                                        borderBottom: "1px solid rgba(16, 17, 20, 0.05)",
                                        transition: "background 0.2s ease",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        style={{ flex: "0 0 auto", opacity: 0.45 }}
                                    >
                                        <path
                                            d="M5 12h14M13 6l6 6-6 6"
                                            fill="none"
                                            stroke="#101114"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </a>
                            ))}
                            {!authUser && (
                                <div style={{ padding: "8px 4px 3px", display: "flex", flexDirection: "column", gap: 6 }}>
                                    <a
                                        href="/giris"
                                        onClick={() => setMenuOpen(false)}
                                        style={{
                                            width: "100%",
                                            textAlign: "center",
                                            padding: "8px 0px",
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
            )}
            {/* headline block */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: narrow ? 78 : "12.5%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    zIndex: 4,
                    pointerEvents: "none",
                }}
            >
                <div
                    className="ss-eyebrow"
                    style={{
                        display: narrow ? "none" : "flex",
                        fontFamily: MONO,
                        fontSize: 12,
                        letterSpacing: "0.02em",
                        color: C.ink2,
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 18,
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: 9,
                            background: C.accent,
                            display: "inline-block",
                        }}
                    />
                    {eyebrow}
                </div>
                <h1
                    className="ss-hl"
                    style={{
                        margin: 0,
                        fontSize: narrow ? 35 : "clamp(44px, 6.1vw, 92px)",
                        lineHeight: 0.96,
                        letterSpacing: "-0.05em",
                        fontWeight: 600,
                        textWrap: "balance" as any,
                    }}
                >
                    {lines.map((l, i) => (
                        <span key={i} style={{ display: "block" }}>
                            {l}
                        </span>
                    ))}
                </h1>
                <p
                    className="ss-sub"
                    style={{
                        display: narrow ? "none" : "block",
                        margin: "18px 0 0",
                        maxWidth: 520,
                        textShadow: `0 0 14px ${C.bg}, 0 0 6px ${C.bg}, 0 0 2px ${C.bg}`,
                        fontSize: 16,
                        lineHeight: 1.45,
                        color: C.ink2,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {subline}
                </p>
            </div>
            {/* search bar: a working search (place, dates, guests) that drives the model */}
            <div
                ref={(el) => {
                    ui.searchWrap = el
                }}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: narrow
                        ? "calc(12.5% + 104px)"
                        : "calc(12.5% + clamp(250px, 26vw, 300px))",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    zIndex: 6,
                    padding: narrow ? "0 12px" : 0,
                }}
            >
                <div
                    className="ss-search"
                    role="search"
                    style={{
                        ...glass,
                        display: "flex",
                        flexWrap: narrow ? "wrap" : "nowrap",
                        alignItems: "center",
                        borderRadius: narrow ? 22 : 999,
                        padding: 6,
                        width: narrow ? "100%" : 620,
                        position: "relative",
                        boxSizing: "border-box",
                    }}
                >
                    {/* 1. ALAN: NEREDEN */}
                    <label
                        className="ss-field"
                        style={{
                            flex: narrow ? "1 1 100%" : 1,
                            padding: "9px 18px 9px 20px",
                            borderRadius: 999,
                            cursor: "text",
                            minWidth: 0,
                            position: "relative",
                            borderBottom: narrow
                                ? `1px solid ${C.line}`
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: "0.02em",
                                    textTransform: "uppercase",
                                    color: C.ink2,
                                }}
                            >
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 99,
                                        background: C.accent,
                                        display: "inline-block",
                                    }}
                                />
                                Nereden
                            </div>
                            <input
                                ref={(el) => {
                                    ui.fromInput = el
                                }}
                                aria-label="Nereden?"
                                placeholder="Örn. Gazi Cd."
                                defaultValue=""
                                autoComplete="off"
                                onFocus={(e) => {
                                    onFrom(e)
                                    e.currentTarget.select()
                                }}
                                onChange={(e) => {
                                    fromTouchedRef.current = true
                                    setSearchWarn(null)
                                    onFrom(e)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && sug.length) {
                                        e.preventDefault()
                                        pickPlaceItem(sug[0], "from")
                                    }
                                    if (e.key === "Escape") setSug([])
                                }}
                                style={{
                                    width: "100%",
                                    border: 0,
                                    outline: "none",
                                    background: "transparent",
                                    padding: 0,
                                    fontFamily: SANS,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                    color: C.ink,
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                swapLocations()
                            }}
                            className="ss-btn ss-focus"
                            aria-label="Kalkış ve varış noktasını değiştir"
                            title="Yönü değiştir"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 99,
                                border: `1px solid ${C.line}`,
                                background: "#fff",
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                color: C.ink,
                                flex: "none",
                                padding: 0,
                            }}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 14 14"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 2.5v9M4 2.5L1.8 4.7M4 2.5l2.2 2.2M10 11.5v-9M10 11.5l-2.2-2.2M10 11.5l2.2-2.2"
                                    stroke={C.ink}
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </label>

                    {/* 2. ALAN: NEREYE */}
                    <label
                        className="ss-field"
                        style={{
                            flex: 1.15,
                            padding: "9px 20px",
                            borderRadius: 999,
                            borderLeft: narrow ? "none" : `1px solid ${C.line}`,
                            cursor: "text",
                            minWidth: 0,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                textTransform: "uppercase",
                                color: C.ink2,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 1.5,
                                    background: C.ink,
                                    display: "inline-block",
                                }}
                            />
                            Nereye
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                                ref={(el) => {
                                    ui.whereInput = el
                                }}
                                aria-label="Nereye gidiyorsunuz?"
                                placeholder="Örn. Elazığ Havalimanı"
                                defaultValue=""
                                autoComplete="off"
                                onFocus={(e) => {
                                    onWhere(e)
                                    e.currentTarget.select()
                                }}
                                onChange={(e) => {
                                    whereTouchedRef.current = true
                                    setSearchWarn(null)
                                    onWhere(e)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && sug.length) {
                                        e.preventDefault()
                                        pickPlaceItem(sug[0], "to")
                                    }
                                    if (e.key === "Escape") setSug([])
                                }}
                                style={{
                                    width: "100%",
                                    border: 0,
                                    outline: "none",
                                    background: "transparent",
                                    padding: 0,
                                    fontFamily: SANS,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                    color: C.ink,
                                }}
                            />
                            <span
                                ref={(el) => {
                                    ui.caret = el
                                }}
                                style={{
                                    width: 1.5,
                                    height: 17,
                                    background: C.accent,
                                    marginLeft: -2,
                                    flex: "none",
                                }}
                            />
                        </div>
                    </label>

                    <button
                        type="button"
                        className="td-call-btn ss-focus"
                        onClick={doSearch}
                        aria-label="Çağır"
                    >
                        <span className="td-glass" aria-hidden="true" />
                        <span className="td-sheen" aria-hidden="true" />
                        <span className="td-hl" aria-hidden="true" />
                        <span style={{ position: "relative", zIndex: 1 }}>Çağır</span>
                    </button>
                    {/* place suggestions */}
                    {sug.length > 0 && (
                        <div
                            role="listbox"
                            aria-label="Konum Önerileri"
                            style={{
                                ...glass,
                                background: "rgba(252,251,248,0.985)",
                                position: "absolute",
                                left: sugField === "to" && !narrow ? 240 : 0,
                                top: "calc(100% + 8px)",
                                width: narrow ? "100%" : 360,
                                maxHeight: 330,
                                overflowY: "auto",
                                borderRadius: 18,
                                padding: 6,
                                zIndex: 30,
                                boxSizing: "border-box",
                            }}
                        >
                            {sug.map((item: any) => (
                                <button
                                    key={item.slug || item.name}
                                    type="button"
                                    className="ss-field ss-focus"
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        pickPlaceItem(item, sugField)
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "8px 10px",
                                        border: 0,
                                        background: "transparent",
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        fontFamily: SANS,
                                        color: C.ink,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 10,
                                            background: item.isGps ? "rgba(58,58,244,0.1)" : "rgba(16,17,20,0.055)",
                                            display: "grid",
                                            placeItems: "center",
                                            color: item.isGps ? C.accent : C.ink,
                                            flex: "none",
                                        }}
                                    >
                                        {item.isGps ? (
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <circle cx="9" cy="9" r="3.2" fill={C.accent} />
                                                <circle cx="9" cy="9" r="6.5" stroke={C.accent} strokeWidth="1.5" />
                                            </svg>
                                        ) : (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z" />
                                                <circle cx="12" cy="10" r="2.5" />
                                            </svg>
                                        )}
                                    </span>
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <span
                                            style={{
                                                display: "block",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.name}
                                        </span>
                                        <span
                                            style={{
                                                display: "block",
                                                fontSize: 12,
                                                color: C.ink2,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.sub || "Elazığ"}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Otomatik Hesaplanan Canlı Fiyat & Mesafe Kartı (Sadece hem Nereden hem Nereye seçildiğinde görünür) */}
                {sug.length === 0 && hasFromPicked && hasToPicked && routeInfo.km > 0 && (() => {
                    const liveBase = Math.max(250, Math.round((50 + routeInfo.km * 45) / 5) * 5)
                    const liveMember = Math.round(liveBase * 0.85)
                    return (
                        <button
                            type="button"
                            onClick={doSearch}
                            className="ss-btn ss-focus"
                            style={{
                                ...glass,
                                background:
                                    "linear-gradient(155deg, rgba(255,255,255,0.82) 0%, rgba(247,247,250,0.64) 50%, rgba(236,237,243,0.54) 100%)",
                                backdropFilter: "blur(28px) saturate(185%)",
                                WebkitBackdropFilter: "blur(28px) saturate(185%)",
                                border: "1px solid rgba(255,255,255,0.88)",
                                boxShadow:
                                    "0 18px 42px -14px rgba(16,17,24,0.22), 0 0 0 0.5px rgba(16,17,20,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
                                borderRadius: narrow ? 18 : 999,
                                padding: narrow ? "9px 11px 9px 13px" : "8px 10px 8px 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: narrow ? "space-between" : "center",
                                gap: narrow ? 8 : 14,
                                cursor: "pointer",
                                fontFamily: SANS,
                                color: C.ink,
                                width: narrow ? "100%" : "auto",
                                maxWidth: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            {narrow ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 0 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>
                                        <span className="pt-live" style={{ width: 6, height: 6 }} />
                                        <span style={{ fontFamily: MONO, color: C.ink, fontWeight: 600 }}>{routeInfo.km} km</span>
                                        <span>· ~{routeInfo.min} dk</span>
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>Sabit ücret:</span>
                                        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.ink }}>{liveBase} TL</span>
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: C.ink2, whiteSpace: "nowrap" }}>
                                        <span className="pt-live" />
                                        <span style={{ fontFamily: MONO, color: C.ink, fontWeight: 600 }}>{routeInfo.km} km</span>
                                        <span>· ~{routeInfo.min} dk</span>
                                    </span>

                                    <span style={{ width: 1, height: 14, background: "rgba(16,17,20,0.12)" }} />

                                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 5, whiteSpace: "nowrap" }}>
                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink2 }}>Sabit:</span>
                                        <span style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{liveBase} TL</span>
                                    </span>
                                </>
                            )}

                            <span
                                className="pt-pill"
                                style={{
                                    padding: narrow ? "5px 6px 5px 10px" : "4px 6px 4px 10px",
                                    fontSize: narrow ? 11.5 : 12,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                            >
                                Üyelere <b>{liveMember} TL</b>
                                <span className="pt-pill-tag" style={{ fontSize: 10.5, padding: "2px 6px" }}>-%15</span>
                            </span>
                        </button>
                    )
                })()}
            </div>
            {/* listing card (bottom sheet on phones) */}
            <a
                ref={(el) => {
                    ui.card = el
                }}
                href={searchLink}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: compactNav ? 310 : 256,
                    zIndex: 7,
                    visibility: "hidden",
                    textDecoration: "none",
                    color: C.ink,
                    borderRadius: compactNav ? 18 : 16,
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow:
                        "0 24px 48px -18px rgba(30,28,20,0.35), 0 0 0 1px rgba(16,17,20,0.06)",
                    display: compactNav ? "flex" : "block",
                }}
            >
                <div
                    style={{
                        height: compactNav ? "auto" : 114,
                        minHeight: compactNav ? 98 : undefined,
                        width: compactNav ? 96 : "auto",
                        flex: "none",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <img
                        ref={(el) => {
                            ui.cardImg = el
                        }}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transformOrigin: "50% 60%",
                        }}
                    />
                    {!compactNav && (
                        <div
                            ref={(el) => {
                                ui.cTag = el
                            }}
                            style={{
                                position: "absolute",
                                left: 8,
                                top: 8,
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.92)",
                            }}
                        >
                            Loved by guests
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={closeCard}
                    className="ss-btn ss-focus"
                    style={{
                        position: "absolute",
                        right: 6,
                        top: 6,
                        width: 24,
                        height: 24,
                        borderRadius: 99,
                        border: 0,
                        background: "rgba(255,255,255,.92)",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                        color: C.ink,
                        zIndex: 2,
                    }}
                >
                    ×
                </button>
                <div
                    style={{
                        padding: compactNav
                            ? "9px 32px 9px 11px"
                            : "10px 12px 11px",
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <div
                        ref={(el) => {
                            ui.cTitle = el
                        }}
                        style={{
                            fontSize: compactNav ? 13.5 : 14,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    />
                    <div
                        ref={(el) => {
                            ui.cMeta = el
                        }}
                        style={{
                            fontSize: 11.5,
                            color: C.ink2,
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            marginTop: 5,
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 .8l1.5 3.4 3.7.3-2.8 2.4.9 3.6L6 8.6 2.7 10.5l.9-3.6L.8 4.5l3.7-.3z"
                                fill={C.ink}
                            />
                        </svg>
                        <span
                            ref={(el) => {
                                ui.cRate = el
                            }}
                        />
                    </div>
                    {!narrow && (
                        <div
                            style={{
                                height: 1,
                                background: C.line,
                                margin: "11px 0 10px",
                            }}
                        />
                    )}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            marginTop: narrow ? 8 : 0,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontFamily: MONO,
                                    fontSize: 17,
                                    fontWeight: 500,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                <span
                                    ref={(el) => {
                                        ui.cPrice = el
                                    }}
                                />{" "}
                                <span
                                    style={{
                                        fontFamily: SANS,
                                        fontSize: 12,
                                        color: C.ink2,
                                        letterSpacing: 0,
                                    }}
                                >
                                    tahmini
                                </span>
                            </div>
                            <div
                                ref={(el) => {
                                    ui.cNight = el
                                }}
                                style={{
                                    fontSize: 11.5,
                                    color: C.ink2,
                                    marginTop: 1,
                                }}
                            />
                        </div>
                        {!narrow && (
                            <span
                                className="ss-btn"
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: "9px 14px",
                                    borderRadius: 999,
                                    background: C.ink,
                                    color: "#fff",
                                }}
                            >
                                Reserve
                            </span>
                        )}
                    </div>
                    {!narrow && (
                        <div
                            ref={(el) => {
                                ui.cHost = el
                            }}
                            style={{
                                fontSize: 11.5,
                                color: C.ink2,
                                marginTop: 9,
                            }}
                        />
                    )}
                </div>
            </a>

            {/* Eksik konum uyarı modalı (aynı buzlu cam pt-card tasarımı) */}
            {searchWarn && (
                <div
                    className="pt-overlay"
                    role="alertdialog"
                    aria-modal="true"
                    aria-label="Konum bilgisi eksik"
                    onClick={() => setSearchWarn(null)}
                >
                    <div className="pt-card" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
                        <span className="pt-glow" aria-hidden="true" />
                        <button
                            type="button"
                            className="pt-close"
                            aria-label="Kapat"
                            onClick={() => setSearchWarn(null)}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <div style={{ textAlign: "center", padding: "8px 4px 2px" }}>
                            <span className="pt-ic" style={{ margin: "0 auto 12px" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11z" />
                                    <circle cx="12" cy="10" r="2.2" />
                                </svg>
                            </span>
                            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>
                                Konum bilgisi eksik
                            </div>
                            <p style={{ margin: "8px auto 0", maxWidth: 280, fontSize: 13.5, lineHeight: 1.48, color: C.ink2 }}>
                                {searchWarn}
                            </p>
                            <button
                                type="button"
                                className="pt-primary"
                                style={{ width: "100%", justifyContent: "center", marginTop: 18, padding: "13px 16px" }}
                                onClick={() => {
                                    setSearchWarn(null)
                                    const fromVal = (uiRef.current.fromInput?.value || "").trim()
                                    if (!fromVal && uiRef.current.fromInput) uiRef.current.fromInput.focus()
                                    else if (uiRef.current.whereInput) uiRef.current.whereInput.focus()
                                }}
                            >
                                <span style={{ fontSize: 14.5, fontWeight: 700 }}>Tamam</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Taksi Çağır modalı: katmanlı buzlu cam (pt-*) */}
            {callModalOpen &&
                (() => {
                    const fromName =
                        (uiRef.current.fromInput && uiRef.current.fromInput.value) ||
                        "Mevcut Konum"
                    const toName =
                        (uiRef.current.whereInput && uiRef.current.whereInput.value) ||
                        "Elysium Park AVM"
                    const rawFare = 50 + routeInfo.km * 45
                    const basePrice = Math.max(250, Math.round(rawFare / 5) * 5)
                    const memberPrice = Math.round(basePrice * 0.85)
                    const CASH_COOLDOWN_KEY = "paytaksi_cash_cooldown_until"
                    const getCashCooldownMin = () => {
                        try {
                            const until = Number(localStorage.getItem(CASH_COOLDOWN_KEY) || 0)
                            const diff = until - Date.now()
                            return diff > 0 ? Math.ceil(diff / 60000) : 0
                        } catch {
                            return 0
                        }
                    }
                    const cooldownMin = getCashCooldownMin()
                    const finish = (mode: "member" | "cash") => {
                        if (mode === "cash") {
                            try {
                                localStorage.setItem(
                                    CASH_COOLDOWN_KEY,
                                    String(Date.now() + 60 * 60 * 1000)
                                )
                            } catch {}
                        }
                        trackEvent("ride_completed")
                        const ridePayload = {
                            pickupAddress: fromName,
                            pickupLat: fromCoord[0],
                            pickupLng: fromCoord[1],
                            destinationAddress: toName,
                            customerPhone:
                                mode === "cash"
                                    ? cashPhone
                                    : authUser?.phoneNumber || authUser?.fullName || "Üye Hesabı",
                            paymentType: mode === "cash" ? "Nakit" : "Cüzdan",
                        }
                        const apiUrl = getApiUrl()
                        fetch(`${apiUrl}/api/rides/request`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(ridePayload),
                        })
                            .then((r) => (r.ok ? r.json() : null))
                            .then((data) => {
                                // Yerelde Meta token tanımlı değilse (simulated=true), WhatsApp mesajının gerçek telefona gelmesi için canlı API'yi de tetikle
                                if (data?.whatsapp?.simulated && apiUrl !== "https://api.paytaksi.com.tr") {
                                    fetch("https://api.paytaksi.com.tr/api/rides/request", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(ridePayload),
                                    }).catch(() => {})
                                }
                            })
                            .catch(() => {
                                if (apiUrl !== "https://api.paytaksi.com.tr") {
                                    fetch("https://api.paytaksi.com.tr/api/rides/request", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(ridePayload),
                                    }).catch(() => {})
                                }
                            })
                        setOrderMode(mode)
                        setOrderSuccess(true)
                        setTimeout(() => setCallModalOpen(false), mode === "cash" ? 4500 : 2800)
                    }
                    return (
                        <div
                            className="pt-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Taksi çağır"
                            onClick={() => setCallModalOpen(false)}
                        >
                            <div className="pt-card" onClick={(e) => e.stopPropagation()}>
                                <span className="pt-glow" aria-hidden="true" />
                                <button
                                    type="button"
                                    className="pt-close"
                                    aria-label="Kapat"
                                    onClick={() => setCallModalOpen(false)}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>

                                {orderSuccess ? (
                                    <div style={{ textAlign: "center", padding: "18px 6px 6px" }}>
                                        <span className="pt-ic pt-ic-ok" style={{ margin: "0 auto 14px" }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                                            </svg>
                                        </span>
                                        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em" }}>
                                            {orderMode === "cash"
                                                ? "Sürücünüze numaranızı ilettik"
                                                : "Taksin yola çıktı"}
                                        </div>
                                        <p style={{ margin: "6px auto 0", maxWidth: 310, fontSize: 13.5, lineHeight: 1.45, color: C.ink2 }}>
                                            {orderMode === "cash"
                                                ? "Sürücünüz 2 dk içinde sizinle iletişime geçecektir."
                                                : `23 T 0421 · Ahmet Usta ${fromName} noktasına geliyor. Tahmini varış ~2 dk.`}
                                        </p>
                                    </div>
                                ) : callStep === "cash-phone" ? (
                                    <>
                                        {/* Geri dön */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCallStep("choose")
                                                setPhoneErr(null)
                                            }}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                border: 0,
                                                background: "none",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                color: C.ink2,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 18l-6-6 6-6" />
                                            </svg>
                                            Geri dön
                                        </button>

                                        {/* Başlık */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 36 }}>
                                            <span className="pt-ic">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
                                                    <path d="M10.5 18.5h3" />
                                                </svg>
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="pt-eyebrow">
                                                    <span className="pt-live" />
                                                    Nakitle devam · {basePrice} TL
                                                </div>
                                                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                                    Telefon numaranız
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{ margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.ink2 }}>
                                            Şoförümüzün size ulaşabilmesi için lütfen telefon numaranızı girin.
                                        </p>

                                        {/* Telefon girişi */}
                                        <label className="pt-tile pt-field" style={{ marginTop: 14 }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                                                <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
                                                <path d="M10.5 18.5h3" />
                                            </svg>
                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                <span className="pt-label" style={{ display: "block" }}>Telefon numarası</span>
                                                <input
                                                    className="pt-input"
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    autoFocus
                                                    value={cashPhone}
                                                    onChange={(e) => {
                                                        let d = e.target.value.replace(/\D/g, "")
                                                        if (d.startsWith("90") && d.length > 10) d = "0" + d.slice(2)
                                                        else if (d.length > 0 && d[0] !== "0") d = "0" + d
                                                        d = d.slice(0, 11)
                                                        const formatted = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
                                                            .filter(Boolean)
                                                            .join(" ")
                                                        setCashPhone(formatted)
                                                        setPhoneErr(null)
                                                    }}
                                                    placeholder="05XX XXX XX XX"
                                                />
                                            </span>
                                        </label>

                                        {phoneErr && (
                                            <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 500, color: "#B3261E" }}>
                                                {phoneErr}
                                            </div>
                                        )}

                                        <div style={{ marginTop: 16 }}>
                                            <button
                                                type="button"
                                                className="pt-primary"
                                                style={{ width: "100%" }}
                                                onClick={() => {
                                                    const rem = getCashCooldownMin()
                                                    if (rem > 0) {
                                                        setPhoneErr(`Nakit ile yeni çağrı için ${rem} dk beklemelisiniz.`)
                                                        return
                                                    }
                                                    const digits = cashPhone.replace(/\D/g, "")
                                                    if (digits.length < 10) {
                                                        setPhoneErr("Lütfen geçerli bir telefon numarası girin.")
                                                        return
                                                    }
                                                    finish("cash")
                                                }}
                                            >
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                                        Taksiyi Çağır
                                                    </span>
                                                    <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                                        {fromName} → {toName}
                                                    </span>
                                                </span>
                                                <span className="pt-badge">{basePrice} TL</span>
                                            </button>
                                        </div>
                                        <div style={{ marginTop: 12, textAlign: "center", fontSize: 11.5, color: "#8E9099" }}>
                                            Numaranız yalnızca şoförünüzle paylaşılır
                                        </div>
                                    </>
                                ) : callStep === "topup" ? (
                                    <>
                                        {/* Geri dön */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCallStep("choose")
                                                setPhoneErr(null)
                                            }}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                border: 0,
                                                background: "none",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                color: C.ink2,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 18l-6-6 6-6" />
                                            </svg>
                                            Geri dön
                                        </button>

                                        {/* Başlık */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 36 }}>
                                            <span className="pt-ic">
                                                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="5" width="20" height="14" rx="2.5" />
                                                    <path d="M2 10h20" />
                                                </svg>
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="pt-eyebrow">
                                                    <span className="pt-live" />
                                                    PayTR Güvenli Ödeme · -%15 İndirim
                                                </div>
                                                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                                    Bakiye Yükle
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.ink2 }}>
                                            Bu yolculuk için indirimli tutar <b>{memberPrice} TL</b>. Yüklemek istediğiniz bakiye tutarını seçin:
                                        </p>

                                        {/* Tutar Seçimi */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
                                            {[memberPrice, 250, 500, 1000].map((amt) => {
                                                const active = walletAmount === amt
                                                return (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        onClick={() => setWalletAmount(amt)}
                                                        style={{
                                                            padding: "11px 6px",
                                                            borderRadius: 14,
                                                            border: active ? `1.5px solid ${C.accent}` : "1px solid rgba(16,17,20,0.12)",
                                                            background: active ? "rgba(58,58,244,0.10)" : "rgba(255,255,255,0.72)",
                                                            color: active ? C.accent : C.ink,
                                                            fontFamily: MONO,
                                                            fontSize: 13.5,
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            transition: "all .18s ease",
                                                        }}
                                                    >
                                                        {amt} TL
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Sözleşme Onay Kutucuğu (PayTR Zorunlu Şartı) */}
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 9,
                                                marginTop: 14,
                                                padding: "10px 12px",
                                                borderRadius: 14,
                                                background: "rgba(255,255,255,0.68)",
                                                border: "1px solid rgba(16,17,20,0.09)",
                                                fontSize: 12,
                                                lineHeight: 1.45,
                                                color: C.ink2,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={topupAgreed}
                                                onChange={(e) => {
                                                    setTopupAgreed(e.target.checked)
                                                    if (e.target.checked) setPhoneErr(null)
                                                }}
                                                style={{ marginTop: 2, accentColor: C.accent, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                                            />
                                            <span>
                                                <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noreferrer" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>
                                                    Ön Bilgilendirme Formu & Mesafeli Satış Sözleşmesi
                                                </a>{" "}
                                                ile{" "}
                                                <a href="/iptal-iade" target="_blank" rel="noreferrer" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>
                                                    İptal ve İade Politikası
                                                </a>
                                                'nı okudum, onaylıyorum.
                                            </span>
                                        </label>

                                        {phoneErr && (
                                            <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 500, color: C.accent, background: "rgba(58,58,244,0.08)", padding: "9px 12px", borderRadius: 12 }}>
                                                {phoneErr}
                                            </div>
                                        )}

                                        <div style={{ marginTop: 14 }}>
                                            <button
                                                type="button"
                                                className="pt-primary"
                                                onClick={() => {
                                                    if (!topupAgreed) {
                                                        setPhoneErr("Devam etmek için lütfen Mesafeli Satış Sözleşmesi ve İptal/İade Koşulları kutucuğunu onaylayın.")
                                                        return
                                                    }
                                                    trackEvent("paytr_topup_click")
                                                    setPhoneErr("PayTR ödeme ekranı entegrasyonu hazır — mağaza bilgileri tanımlandığında ödeme sayfasına yönlendirilecek.")
                                                }}
                                            >
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                                        PayTR ile Güvenli Yükle
                                                    </span>
                                                    <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                                        3D Secure · Banka & Kredi Kartı
                                                    </span>
                                                </span>
                                                <span className="pt-badge">{walletAmount} TL</span>
                                            </button>
                                        </div>
                                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 6 }}>
                                            {/* PayTR Logo */}
                                            <span style={{ height: 26, padding: "0 8px", borderRadius: 7, border: "1px solid rgba(16,17,20,0.1)", background: "#fff", display: "inline-flex", alignItems: "center" }}>
                                                <svg width="46" height="14" viewBox="0 0 108 32" aria-label="PayTR">
                                                    <rect x="0" y="4" width="24" height="24" rx="6" fill="#0B5CAD" />
                                                    <path d="M7 16.5l3.5 3.5 6.5-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                                    <text x="30" y="23" fontFamily="'Inter Tight', 'Inter', sans-serif" fontWeight="800" fontSize="21" letterSpacing="-0.6" fill="#101114">
                                                        Pay<tspan fill="#0B5CAD">TR</tspan>
                                                    </text>
                                                </svg>
                                            </span>
                                            {/* VISA Logo */}
                                            <span style={{ height: 26, padding: "0 8px", borderRadius: 7, border: "1px solid rgba(16,17,20,0.1)", background: "#fff", display: "inline-flex", alignItems: "center" }}>
                                                <svg width="36" height="12" viewBox="0 0 84 28" aria-label="VISA">
                                                    <text x="2" y="22" fontFamily="'Inter Tight', 'Arial Black', sans-serif" fontWeight="900" fontStyle="italic" fontSize="25" letterSpacing="-1" fill="#1A1F71">
                                                        VISA
                                                    </text>
                                                    <path d="M4 4h11l3 5" fill="none" stroke="#F7B600" strokeWidth="2.6" strokeLinecap="round" />
                                                </svg>
                                            </span>
                                            {/* Mastercard Logo */}
                                            <span style={{ height: 26, padding: "0 8px", borderRadius: 7, border: "1px solid rgba(16,17,20,0.1)", background: "#fff", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <svg width="24" height="14" viewBox="0 0 36 22" aria-label="Mastercard">
                                                    <circle cx="13" cy="11" r="9" fill="#EB001B" />
                                                    <circle cx="23" cy="11" r="9" fill="#F79E1B" fillOpacity="0.9" />
                                                </svg>
                                            </span>
                                            {/* TROY Logo */}
                                            <span style={{ height: 26, padding: "0 8px", borderRadius: 7, border: "1px solid rgba(16,17,20,0.1)", background: "#fff", display: "inline-flex", alignItems: "center" }}>
                                                <svg width="40" height="14" viewBox="0 0 92 32" aria-label="TROY">
                                                    <text x="2" y="23" fontFamily="'Inter Tight', 'Inter', sans-serif" fontWeight="900" fontSize="23" letterSpacing="-0.5" fill="#003865">
                                                        troy
                                                    </text>
                                                    <circle cx="67" cy="15" r="7.5" fill="#00A3E0" />
                                                    <path d="M64 15l2.2 2.2 4.5-4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                            {/* 256-Bit SSL */}
                                            <span style={{ height: 26, padding: "0 8px", borderRadius: 7, border: "1px solid rgba(16,17,20,0.1)", background: "#fff", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#0E8A5F" }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0E8A5F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="4" y="11" width="16" height="10" rx="2" />
                                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                                </svg>
                                                256-Bit SSL
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Başlık */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 40 }}>
                                            <span className="pt-ic">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 16.5V12l1.8-4.6A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.4L19 12v4.5" />
                                                    <path d="M4 12h16v4.5H4zM9.5 6V4.5h5V6" />
                                                    <circle cx="7.5" cy="16.5" r="1.6" />
                                                    <circle cx="16.5" cy="16.5" r="1.6" />
                                                </svg>
                                            </span>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="pt-eyebrow">
                                                    <span className="pt-live" />
                                                    Elazığ · en yakın taksi ~2 dk
                                                </div>
                                                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                                    Taksini çağır
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rota */}
                                        <div className="pt-tile" style={{ marginTop: 18, padding: "4px 14px" }}>
                                            <div className="pt-stop">
                                                <span className="pt-dot" />
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="pt-label">Alınma yeri</div>
                                                    <div className="pt-place">{fromName}</div>
                                                </div>
                                            </div>
                                            <div className="pt-link" aria-hidden="true" />
                                            <div className="pt-stop">
                                                <span className="pt-dot pt-dot-end" />
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="pt-label">Varış yeri</div>
                                                    <div className="pt-place">{toName}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ücret */}
                                        <div
                                            className="pt-tile"
                                            style={{ marginTop: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                                        >
                                            <div>
                                                <div className="pt-label">
                                                    Sabit ücret · {routeInfo.km} km (~{routeInfo.min} dk)
                                                </div>
                                                <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 2 }}>
                                                    {basePrice} TL
                                                </div>
                                            </div>
                                            <span className="pt-pill">
                                                Üyelere <b>{memberPrice} TL</b>
                                                <span className="pt-pill-tag">-%15</span>
                                            </span>
                                        </div>

                                        {/* Aksiyonlar */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                                            <button
                                                type="button"
                                                className="pt-primary"
                                                onClick={() => {
                                                    trackEvent("wallet_click")
                                                    const hasToken = Boolean(authUser || localStorage.getItem("paytaksi_jwt_token"))
                                                    if (!hasToken) {
                                                        window.location.href = "/giris"
                                                        return
                                                    }
                                                    setWalletAmount(memberPrice)
                                                    setPhoneErr(null)
                                                    setCallStep("topup")
                                                }}
                                            >
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                                        {authUser ? "Bakiye yükle, %15 indirim kazan" : "Giriş yap, %15 indirimle çağır"}
                                                    </span>
                                                    <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                                        {authUser ? "PayTR ile güvenli bakiye yükle ve hemen çağır" : "Google veya e-posta ile saniyeler içinde giriş"}
                                                    </span>
                                                </span>
                                                <span className="pt-badge">{memberPrice} TL</span>
                                            </button>
                                            <div className="pt-divider">veya</div>
                                            <button
                                                type="button"
                                                className="pt-tile pt-ghost"
                                                disabled={cooldownMin > 0}
                                                onClick={() => {
                                                    if (cooldownMin > 0) return
                                                    trackEvent("cash_click")
                                                    if (authUser?.phoneNumber && !cashPhone) {
                                                        setCashPhone(authUser.phoneNumber)
                                                    }
                                                    setCallStep("cash-phone")
                                                    setPhoneErr(null)
                                                }}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 12,
                                                    textAlign: "left",
                                                    background: "rgba(255, 255, 255, 0.65)",
                                                    border: "1px solid rgba(255, 255, 255, 0.92)",
                                                    boxShadow:
                                                        "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(16,17,20,0.05), 0 8px 20px -14px rgba(16,17,20,0.22)",
                                                    ...(cooldownMin > 0
                                                        ? { opacity: 0.48, cursor: "not-allowed" }
                                                        : {}),
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                                                    <span
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 12,
                                                            background: "rgba(22, 163, 74, 0.12)",
                                                            color: "#15803d",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            flex: "none",
                                                        }}
                                                        aria-hidden="true"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="2" y="6" width="20" height="12" rx="2.5" />
                                                            <circle cx="12" cy="12" r="2.6" />
                                                            <path d="M6 12h.01M18 12h.01" />
                                                        </svg>
                                                    </span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="pt-label">Araçta nakit öde</div>
                                                        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink, marginTop: 1 }}>
                                                            Nakitle devam et
                                                        </div>
                                                    </div>
                                                </div>
                                                <span
                                                    className="pt-pill"
                                                    style={{
                                                        background: "rgba(22, 163, 74, 0.09)",
                                                        borderColor: "rgba(22, 163, 74, 0.22)",
                                                    }}
                                                >
                                                    <b style={{ color: "#15803d" }}>
                                                        {cooldownMin > 0 ? `${cooldownMin} dk` : `${basePrice} TL`}
                                                    </b>
                                                    <span className="pt-pill-tag" style={{ background: "#15803d" }}>
                                                        {cooldownMin > 0 ? "Bekle" : "Nakit"}
                                                    </span>
                                                </span>
                                            </button>
                                            {cooldownMin > 0 && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        lineHeight: 1.4,
                                                        color: "#8A4B00",
                                                        background: "rgba(245, 184, 0, 0.14)",
                                                        border: "1px solid rgba(245, 184, 0, 0.35)",
                                                        borderRadius: 12,
                                                        padding: "9px 12px",
                                                    }}
                                                >
                                                    {authUser ? (
                                                        <>
                                                            Nakit ile 1 saat içinde tekrar taksi çağıramazsınız ({cooldownMin} dk kaldı). Beklemeden hemen çağırmak için üstten <b>Bakiye yükle</b> seçeneğini kullanabilirsiniz.
                                                        </>
                                                    ) : (
                                                        <>
                                                            Nakit ile 1 saat içinde tekrar taksi çağıramazsınız ({cooldownMin} dk kaldı). Hemen çağırmak için üstten <b>Giriş yap</b> seçeneğini kullanıp bakiye yükleyebilirsiniz.
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: 500, color: C.ink }}>
                                            Sürpriz ücret yok · Sabit tarife · Ücretsiz iptal
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })()}

            {/* Tarifeler modalı */}
            {tariffModalOpen && (
                <div
                    className="pt-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Elazığ Taksi Tarifeleri"
                    onClick={() => setTariffModalOpen(false)}
                >
                    <div className="pt-card" onClick={(e) => e.stopPropagation()}>
                        <span className="pt-glow" aria-hidden="true" />
                        <button
                            type="button"
                            className="pt-close"
                            aria-label="Kapat"
                            onClick={() => setTariffModalOpen(false)}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 40 }}>
                            <span className="pt-ic">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="6" width="20" height="12" rx="2.5" />
                                    <circle cx="12" cy="12" r="2.6" />
                                    <path d="M6 12h.01M18 12h.01" />
                                </svg>
                            </span>
                            <div style={{ minWidth: 0 }}>
                                <div className="pt-eyebrow">
                                    <span className="pt-live" />
                                    Elazığ · Güncel Tarife
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                    Taksi Tarifeleri
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                            <div className="pt-tile" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div className="pt-label">İndi - Bindi</div>
                                    <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>Kısa mesafe taban ücreti</div>
                                </div>
                                <span className="pt-pill">
                                    <b>250 TL</b>
                                </span>
                            </div>

                            <div className="pt-tile" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div className="pt-label">Taksimetre Açılış (Sabit Ücret)</div>
                                    <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>Elazığ başlangıç tarifesi</div>
                                </div>
                                <span className="pt-pill">
                                    <b>50 TL</b>
                                </span>
                            </div>

                            <div className="pt-tile" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div className="pt-label">Kilometre Başı Ücret</div>
                                    <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>Her 1 km için</div>
                                </div>
                                <span className="pt-pill">
                                    <b>45 TL / km</b>
                                </span>
                            </div>

                            <div className="pt-tile" style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div className="pt-label">Bekleme Ücreti</div>
                                    <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>Dakika başı bekleme</div>
                                </div>
                                <span className="pt-pill">
                                    <b>7,50 TL / dk</b>
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: 500, color: C.ink }}>
                            Üyelere ilk yolculuğa özel %15 indirim · Sürpriz ücret yok
                        </div>
                    </div>
                </div>
            )}

            {/* Bizimle Çalışın (Taksici Başvuru) modalı */}
            {partnerModalOpen && (
                <div
                    className="pt-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Bizimle Çalışın"
                    onClick={() => setPartnerModalOpen(false)}
                >
                    <div className="pt-card" onClick={(e) => e.stopPropagation()}>
                        <span className="pt-glow" aria-hidden="true" />
                        <button
                            type="button"
                            className="pt-close"
                            aria-label="Kapat"
                            onClick={() => setPartnerModalOpen(false)}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {partnerSent ? (
                            <div style={{ textAlign: "center", padding: "18px 6px 6px" }}>
                                <span className="pt-ic pt-ic-ok" style={{ margin: "0 auto 14px" }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                                    </svg>
                                </span>
                                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
                                    Başvurunuz alındı!
                                </div>
                                <p style={{ margin: "8px auto 0", maxWidth: 310, fontSize: 13.5, lineHeight: 1.5, color: C.ink2 }}>
                                    Ekibimiz en kısa sürede <b>{partnerForm.phone}</b> numarasından sizinle iletişime geçecektir.
                                </p>
                                <button
                                    type="button"
                                    className="pt-primary"
                                    onClick={() => setPartnerModalOpen(false)}
                                    style={{ marginTop: 18, justifyContent: "center", textAlign: "center" }}
                                >
                                    <span style={{ fontSize: 15, fontWeight: 700 }}>Tamam</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 40 }}>
                                    <span className="pt-ic">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 16.5V12l1.8-4.6A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.4L19 12v4.5" />
                                            <path d="M4 12h16v4.5H4zM9.5 6V4.5h5V6" />
                                            <circle cx="7.5" cy="16.5" r="1.6" />
                                            <circle cx="16.5" cy="16.5" r="1.6" />
                                        </svg>
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="pt-eyebrow">
                                            <span className="pt-live" />
                                            Elazığ · Sürücü Başvurusu
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                            Bizimle Çalışın
                                        </div>
                                    </div>
                                </div>

                                <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.45, color: C.ink2 }}>
                                    PayTaksi ağına katılın, Elazığ genelinde anlık yolcu çağrılarıyla kazancınızı artırın.
                                </p>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        trackEvent("driver_apply")
                                        setPartnerSent(true)
                                    }}
                                    style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}
                                >
                                    <label className="pt-tile pt-field">
                                        <span style={{ flex: 1, minWidth: 0 }}>
                                            <span className="pt-label" style={{ display: "block" }}>Ad Soyad</span>
                                            <input
                                                className="pt-input"
                                                required
                                                value={partnerForm.name}
                                                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                                                placeholder="Örn: Ahmet Yılmaz"
                                            />
                                        </span>
                                    </label>
                                    <label className="pt-tile pt-field">
                                        <span style={{ flex: 1, minWidth: 0 }}>
                                            <span className="pt-label" style={{ display: "block" }}>Telefon Numarası</span>
                                            <input
                                                className="pt-input"
                                                type="tel"
                                                inputMode="tel"
                                                required
                                                value={partnerForm.phone}
                                                onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </span>
                                    </label>
                                    <label className="pt-tile pt-field">
                                        <span style={{ flex: 1, minWidth: 0 }}>
                                            <span className="pt-label" style={{ display: "block" }}>Taksi Plakası</span>
                                            <input
                                                className="pt-input"
                                                required
                                                value={partnerForm.plate}
                                                onChange={(e) => setPartnerForm({ ...partnerForm, plate: e.target.value.toUpperCase() })}
                                                placeholder="23 T 0000"
                                            />
                                        </span>
                                    </label>
                                    <button type="submit" className="pt-primary" style={{ marginTop: 6 }}>
                                        <span style={{ flex: 1, minWidth: 0 }}>
                                            <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
                                                Başvuru Gönder
                                            </span>
                                            <span style={{ display: "block", fontSize: 12, opacity: 0.82, marginTop: 2 }}>
                                                Aynı gün içinde dönüş yapılır
                                            </span>
                                        </span>
                                        <span className="pt-badge">23 T</span>
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Haritadan Alınış ve Bırakılış Seçme Modalı */}
            {mapPickerOpen &&
                (() => {
                    const liveBase = Math.max(250, Math.round((50 + routeInfo.km * 45) / 5) * 5)
                    const liveMember = Math.round(liveBase * 0.85)
                    return (
                        <div
                            className="pt-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Haritadan Konum Seç"
                            style={narrow ? { padding: 0, alignItems: "stretch" } : undefined}
                            onClick={() => setMapPickerOpen(false)}
                        >
                            <div
                                className="pt-card pt-map-card"
                                style={
                                    narrow
                                        ? {
                                              width: "100vw",
                                              maxWidth: "100vw",
                                              height: "100dvh",
                                              borderRadius: 0,
                                              padding: "16px 14px 16px",
                                              display: "flex",
                                              flexDirection: "column",
                                              background: "rgba(248, 247, 244, 0.96)",
                                              backdropFilter: "none",
                                              WebkitBackdropFilter: "none",
                                          }
                                        : { maxWidth: 540, padding: 22 }
                                }
                                onClick={(e) => e.stopPropagation()}
                            >
                                {!narrow && <span className="pt-glow" aria-hidden="true" />}
                                <button
                                    type="button"
                                    className="pt-close"
                                    aria-label="Kapat"
                                    style={narrow ? { top: 14, right: 14, width: 38, height: 38 } : undefined}
                                    onClick={() => setMapPickerOpen(false)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101114" strokeWidth="2.4" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 44, flexShrink: 0 }}>
                                    <span className="pt-ic" style={{ width: 46, height: 46 }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z" />
                                            <circle cx="12" cy="10" r="2.5" />
                                        </svg>
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="pt-eyebrow" style={{ fontSize: 11.5 }}>
                                            <span className="pt-live" />
                                            Haritaya dokunun veya iğneyi sürükleyin
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 2 }}>
                                            Haritadan Konum Seç
                                        </div>
                                    </div>
                                </div>

                                {/* Alınış / Bırakılış Sekmeleri (Daha büyük ve rahat dokunma alanı) */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, flexShrink: 0 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMapPickerField("from")
                                            leafletRef.current?.map?.panTo(fromCoord)
                                        }}
                                        style={{
                                            padding: "13px 14px",
                                            borderRadius: 18,
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontFamily: SANS,
                                            background: mapPickerField === "from" ? "rgba(58,58,244,0.12)" : "rgba(255,255,255,0.85)",
                                            border: mapPickerField === "from" ? `2px solid ${C.accent}` : "1px solid rgba(16,17,20,0.12)",
                                            boxShadow: "inset 0 1px 0 #fff",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <span style={{ width: 9, height: 9, borderRadius: 99, background: C.accent, flexShrink: 0 }} />
                                            <span className="pt-label" style={{ fontSize: 11.5, color: mapPickerField === "from" ? C.accent : undefined }}>
                                                1. Alınış Yeri
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14.5, fontWeight: 700, color: mapFromLabel ? C.ink : C.ink2, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {mapFromLabel || "Haritadan seçin"}
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMapPickerField("to")
                                            leafletRef.current?.map?.panTo(toCoord)
                                        }}
                                        style={{
                                            padding: "13px 14px",
                                            borderRadius: 18,
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontFamily: SANS,
                                            background: mapPickerField === "to" ? "rgba(16,17,20,0.10)" : "rgba(255,255,255,0.85)",
                                            border: mapPickerField === "to" ? `2px solid ${C.ink}` : "1px solid rgba(16,17,20,0.12)",
                                            boxShadow: "inset 0 1px 0 #fff",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z" />
                                                <circle cx="12" cy="10" r="2.5" />
                                            </svg>
                                            <span className="pt-label" style={{ fontSize: 11.5, color: mapPickerField === "to" ? C.ink : undefined }}>
                                                2. Varış Yeri
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14.5, fontWeight: 700, color: mapToLabel ? C.ink : C.ink2, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {mapToLabel || "Haritadan seçin"}
                                        </div>
                                    </button>
                                </div>

                                {/* İnteraktif Elazığ Haritası (Telefonda tüm orta alanı doldurur) */}
                                <div
                                    style={{
                                        marginTop: 12,
                                        flex: narrow ? 1 : "none",
                                        height: narrow ? "auto" : 290,
                                        minHeight: narrow ? 240 : 290,
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        border: "1px solid rgba(16,17,20,0.12)",
                                        boxShadow: "0 10px 26px -14px rgba(16,17,24,0.22)",
                                        position: "relative",
                                    }}
                                >
                                    <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />

                                    {/* Özel Minimalist Cam Harita Kontrolleri (+ / - / GPS) */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 12,
                                            bottom: 12,
                                            zIndex: 10,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            aria-label="Konumuma odaklan"
                                            title="Konumuma odaklan"
                                            onClick={() => leafletRef.current?.map?.locateMe?.()}
                                            style={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 13,
                                                border: "1px solid rgba(255,255,255,0.92)",
                                                background: "rgba(255,255,255,0.88)",
                                                backdropFilter: "blur(14px)",
                                                WebkitBackdropFilter: "blur(14px)",
                                                boxShadow: "0 8px 20px -6px rgba(16,17,24,0.28), inset 0 1px 0 #fff",
                                                display: "grid",
                                                placeItems: "center",
                                                cursor: "pointer",
                                                color: C.accent,
                                                padding: 0,
                                            }}
                                        >
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
                                                <circle cx="12" cy="12" r="8" />
                                                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                                            </svg>
                                        </button>

                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                borderRadius: 14,
                                                overflow: "hidden",
                                                border: "1px solid rgba(255,255,255,0.92)",
                                                background: "rgba(255,255,255,0.88)",
                                                backdropFilter: "blur(14px)",
                                                WebkitBackdropFilter: "blur(14px)",
                                                boxShadow: "0 8px 20px -6px rgba(16,17,24,0.28), inset 0 1px 0 #fff",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                aria-label="Yakınlaştır"
                                                onClick={() => leafletRef.current?.map?.zoomIn?.()}
                                                style={{
                                                    width: 38,
                                                    height: 36,
                                                    border: 0,
                                                    borderBottom: "1px solid rgba(16,17,20,0.08)",
                                                    background: "transparent",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    cursor: "pointer",
                                                    color: C.ink,
                                                    padding: 0,
                                                }}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Uzaklaştır"
                                                onClick={() => leafletRef.current?.map?.zoomOut?.()}
                                                style={{
                                                    width: 38,
                                                    height: 36,
                                                    border: 0,
                                                    background: "transparent",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    cursor: "pointer",
                                                    color: C.ink,
                                                    padding: 0,
                                                }}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                                                    <path d="M5 12h14" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mesafe ve Ücret Özeti (Sadece hem Alınış hem Varış seçildiğinde görünür) */}
                                {hasFromPicked && hasToPicked && routeInfo.km > 0 && (
                                    <div
                                        className="pt-tile"
                                        style={{
                                            marginTop: 12,
                                            padding: "13px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            background: "rgba(255,255,255,0.9)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div>
                                            <div className="pt-label" style={{ fontSize: 11.5 }}>
                                                {routeInfo.km} km · ~{routeInfo.min} dk sürüş
                                            </div>
                                            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 2 }}>
                                                {liveBase} TL
                                            </div>
                                        </div>
                                        <span className="pt-pill" style={{ padding: "8px 10px 8px 13px", fontSize: 13.5 }}>
                                            Üyelere <b>{liveMember} TL</b>
                                            <span className="pt-pill-tag" style={{ fontSize: 11.5, padding: "3px 8px" }}>-%15</span>
                                        </span>
                                    </div>
                                )}

                                {/* Onay Butonu (Daha büyük ve belirgin) */}
                                <div style={{ marginTop: 12, flexShrink: 0 }}>
                                    {gpsConfirmMode ? (
                                        <button
                                            type="button"
                                            className="pt-primary"
                                            style={{ padding: "16px 18px" }}
                                            onClick={() => {
                                                const finalLabel =
                                                    mapFromLabel && !/^\d+\.\d+/.test(mapFromLabel)
                                                        ? mapFromLabel
                                                        : "Mevcut Konum"
                                                if (uiRef.current.fromInput) {
                                                    uiRef.current.fromInput.value = finalLabel
                                                }
                                                setMapFromLabel(finalLabel)
                                                fromTouchedRef.current = true
                                                setHasFromPicked(true)
                                                setSearchWarn(null)
                                                setGpsConfirmMode(false)
                                                setMapPickerOpen(false)
                                                setTimeout(() => goFromRegion(3, finalLabel), 120)
                                            }}
                                        >
                                            <span style={{ flex: 1 }}>
                                                <span style={{ display: "block", fontSize: 16.5, fontWeight: 700 }}>
                                                    Mevcut Konumu Onayla
                                                </span>
                                                <span style={{ display: "block", fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>
                                                    {mapFromLabel || "Haritadaki noktanız onaylanacak"}
                                                </span>
                                            </span>
                                            <span className="pt-badge" style={{ fontSize: 14, padding: "9px 12px" }}>GPS</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="pt-primary"
                                            style={{ padding: "16px 18px" }}
                                            onClick={() => {
                                                if (uiRef.current.fromInput && mapFromLabel) {
                                                    uiRef.current.fromInput.value = mapFromLabel
                                                    fromTouchedRef.current = true
                                                    setHasFromPicked(true)
                                                }
                                                if (uiRef.current.whereInput && mapToLabel) {
                                                    uiRef.current.whereInput.value = mapToLabel
                                                    whereTouchedRef.current = true
                                                    setHasToPicked(true)
                                                }
                                                setSearchWarn(null)
                                                setMapPickerOpen(false)
                                            }}
                                        >
                                            <span style={{ flex: 1 }}>
                                                <span style={{ display: "block", fontSize: 16.5, fontWeight: 700 }}>
                                                    Konumları Onayla
                                                </span>
                                                <span style={{ display: "block", fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>
                                                    {mapFromLabel && mapToLabel
                                                        ? `${mapFromLabel} → ${mapToLabel}`
                                                        : mapFromLabel || mapToLabel || "Haritadan nokta seçin"}
                                                </span>
                                            </span>
                                            {hasFromPicked && hasToPicked && routeInfo.km > 0 && (
                                                <span className="pt-badge" style={{ fontSize: 14, padding: "9px 12px" }}>{liveMember} TL</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })()}
        </div>
    )
}

addPropertyControls(StaysiftHero, {
    headline: {
        type: ControlType.String,
        title: "Headline",
        defaultValue: "Find a place to stay,\nanywhere you’re going.",
        displayTextArea: true,
    },
    subline: {
        type: ControlType.String,
        title: "Subline",
        defaultValue:
            "Homes, cabins and flats from local hosts in 41 places. See real prices for your dates before you tap on anything.",
        displayTextArea: true,
    },
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "2,184 homes · prices shown for your dates",
    },
    searchLink: {
        type: ControlType.Link,
        title: "Search link",
        defaultValue: "/stays",
    },
    showNav: {
        type: ControlType.Boolean,
        title: "Built-in nav",
        defaultValue: false,
    },
    previewTime: {
        type: ControlType.Number,
        title: "Preview time",
        defaultValue: -1,
        min: -1,
        max: 30,
        step: 0.1,
    },
})
