from __future__ import annotations

import math
import re
from pathlib import Path

import fitz
from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs" / "floatboat-brochure"
SCREEN_DIR = TMP_DIR / "rendered"
PDF_PATH = OUT_DIR / "floatboat-demo-system-brochure.pdf"

PAGE = landscape(A4)
W, H = PAGE
M = 36

NAVY = colors.HexColor("#073B4C")
DEEP = colors.HexColor("#062A35")
TEAL = colors.HexColor("#0E7490")
CYAN = colors.HexColor("#22D3EE")
SKY = colors.HexColor("#E6F7FB")
PAPER = colors.HexColor("#F8FAFC")
WHITE = colors.white
AMBER = colors.HexColor("#F59E0B")
GOLD = colors.HexColor("#FACC15")
MINT = colors.HexColor("#10B981")
ROSE = colors.HexColor("#F43F5E")
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
LINE = colors.HexColor("#DCE7EC")

ASSETS = {
    "hero": ROOT / "public" / "hero-floatboat-houseboat.jpg",
    "gallery_1": ROOT / "public" / "images" / "floatboat" / "gallery" / "img-8747.jpg",
    "gallery_2": ROOT / "public" / "images" / "floatboat" / "gallery" / "img-8749.jpg",
    "gallery_3": ROOT / "public" / "images" / "floatboat" / "gallery" / "img-8756.jpg",
    "gallery_4": ROOT / "public" / "images" / "floatboat" / "gallery" / "img-8773.jpg",
    "cabin_1": ROOT / "public" / "images" / "floatboat" / "cabins" / "cabin-01.jpg",
    "cabin_2": ROOT / "public" / "images" / "floatboat" / "cabins" / "cabin-03.jpg",
    "cabin_3": ROOT / "public" / "images" / "floatboat" / "cabins" / "cabin-06.jpg",
    "spot_1": ROOT / "public" / "images" / "floatboat" / "destinations" / "tanguar-haor-v3.jpg",
    "spot_2": ROOT / "public" / "images" / "floatboat" / "destinations" / "niladri-lake-v2.jpg",
    "spot_3": ROOT / "public" / "images" / "floatboat" / "destinations" / "barikkatila-v3.jpg",
    "spot_4": ROOT / "public" / "images" / "padma" / "padma-bridge.jpg",
}


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    SCREEN_DIR.mkdir(parents=True, exist_ok=True)


def hex_color(value: str):
    return colors.HexColor(value)


def set_alpha(c: canvas.Canvas, fill: float | None = None, stroke: float | None = None) -> None:
    if fill is not None and hasattr(c, "setFillAlpha"):
        c.setFillAlpha(fill)
    if stroke is not None and hasattr(c, "setStrokeAlpha"):
        c.setStrokeAlpha(stroke)


def sanitize(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "_", name).strip("_").lower()


def prepared_image(
    src: Path,
    key: str,
    aspect: float,
    darken: float = 0,
    radius: int = 0,
    width_px: int = 1200,
) -> Path | None:
    if not src.exists():
        return None

    out_h = max(360, int(width_px / max(aspect, 0.1)))
    if out_h > 1400:
        out_h = 1400
        width_px = int(out_h * aspect)

    # JPEG keeps the brochure generator fast and the final PDF compact. The PDF
    # layout still draws framed image areas around these crops.
    dest = TMP_DIR / f"{sanitize(key)}_{int(aspect * 1000)}_{int(darken * 100)}_{radius}.jpg"
    if dest.exists():
        return dest

    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    src_ratio = im.width / im.height

    if src_ratio > aspect:
        new_w = int(im.height * aspect)
        left = (im.width - new_w) // 2
        im = im.crop((left, 0, left + new_w, im.height))
    else:
        new_h = int(im.width / aspect)
        top = (im.height - new_h) // 2
        im = im.crop((0, top, im.width, top + new_h))

    resampling = getattr(Image, "Resampling", Image).LANCZOS
    im = im.resize((width_px, out_h), resampling)

    if darken:
        overlay = Image.new("RGB", im.size, (0, 0, 0))
        im = Image.blend(im, overlay, darken)

    im.save(dest, quality=86, optimize=True)
    return dest


def draw_image_fill(
    c: canvas.Canvas,
    src: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    key: str,
    darken: float = 0,
    radius: int = 0,
) -> None:
    img = prepared_image(src, key, w / h, darken=darken, radius=radius)
    if not img:
        c.saveState()
        c.setFillColor(SKY)
        c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x + w / 2, y + h / 2, "FloatBoat visual")
        c.restoreState()
        return
    c.drawImage(ImageReader(str(img)), x, y, w, h, mask="auto")


def text_width(text: str, font: str, size: float) -> float:
    return stringWidth(text, font, size)


def draw_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    size: float,
    font: str = "Helvetica",
    color=SLATE,
) -> None:
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, text)


def wrap_lines(text: str, font: str, size: float, max_w: float) -> list[str]:
    lines: list[str] = []
    for raw in text.split("\n"):
        words = raw.split()
        if not words:
            lines.append("")
            continue
        line = words[0]
        for word in words[1:]:
            test = f"{line} {word}"
            if text_width(test, font, size) <= max_w:
                line = test
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    w: float,
    size: float = 11,
    leading: float | None = None,
    font: str = "Helvetica",
    color=MUTED,
    max_lines: int | None = None,
) -> float:
    leading = leading or size * 1.32
    lines = wrap_lines(text, font, size, w)
    if max_lines is not None and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".") + "..."
    c.setFillColor(color)
    c.setFont(font, size)
    yy = y
    for line in lines:
        c.drawString(x, yy, line)
        yy -= leading
    return yy


def card(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    bg=WHITE,
    stroke=LINE,
    radius: int = 8,
    shadow: bool = True,
) -> None:
    c.saveState()
    if shadow:
        c.setFillColor(DEEP)
        set_alpha(c, fill=0.08)
        c.roundRect(x + 2, y - 3, w, h, radius, fill=1, stroke=0)
        set_alpha(c, fill=1)
    c.setFillColor(bg)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    c.restoreState()


def pill(c: canvas.Canvas, x: float, y: float, label: str, bg=SKY, fg=TEAL, size: float = 9) -> float:
    w = text_width(label, "Helvetica-Bold", size) + 18
    c.saveState()
    c.setFillColor(bg)
    c.roundRect(x, y, w, 20, 10, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", size)
    c.drawCentredString(x + w / 2, y + 6, label)
    c.restoreState()
    return w


def logo(c: canvas.Canvas, x: float, y: float, scale: float = 1.0, light: bool = False) -> None:
    c.saveState()
    s = scale
    dark = WHITE if light else DEEP
    teal = CYAN if light else TEAL
    c.setFillColor(GOLD)
    c.circle(x + 34 * s, y + 36 * s, 23 * s, fill=1, stroke=0)
    c.setStrokeColor(CYAN)
    c.setLineWidth(5 * s)
    c.line(x + 3 * s, y + 12 * s, x + 112 * s, y + 12 * s)
    c.setFillColor(DEEP if not light else colors.HexColor("#F8FAFC"))
    p = c.beginPath()
    p.moveTo(x + 10 * s, y + 26 * s)
    p.lineTo(x + 103 * s, y + 26 * s)
    p.curveTo(x + 122 * s, y + 25 * s, x + 133 * s, y + 13 * s, x + 139 * s, y + 2 * s)
    p.lineTo(x + 37 * s, y + 2 * s)
    p.curveTo(x + 23 * s, y + 3 * s, x + 12 * s, y + 13 * s, x + 10 * s, y + 26 * s)
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(WHITE)
    roof = c.beginPath()
    roof.moveTo(x + 29 * s, y + 59 * s)
    roof.lineTo(x + 91 * s, y + 59 * s)
    roof.lineTo(x + 106 * s, y + 26 * s)
    roof.lineTo(x + 16 * s, y + 26 * s)
    roof.close()
    c.drawPath(roof, fill=1, stroke=0)
    c.setFillColor(AMBER)
    cabin = c.beginPath()
    cabin.moveTo(x + 36 * s, y + 75 * s)
    cabin.lineTo(x + 85 * s, y + 75 * s)
    cabin.lineTo(x + 95 * s, y + 59 * s)
    cabin.lineTo(x + 27 * s, y + 59 * s)
    cabin.close()
    c.drawPath(cabin, fill=1, stroke=0)
    c.setFillColor(TEAL)
    for dx in (34, 55, 76):
        c.roundRect(x + dx * s, y + 35 * s, 14 * s, 13 * s, 2 * s, fill=1, stroke=0)
    c.setFillColor(dark)
    word_size = 35 * s
    word_x = x + 154 * s
    word_y = y + 45 * s
    c.setFont("Helvetica-Bold", word_size)
    c.drawString(word_x, word_y, "Float")
    c.setFillColor(teal)
    c.drawString(word_x + text_width("Float", "Helvetica-Bold", word_size) - 2 * s, word_y, "Boat")
    c.setStrokeColor(AMBER)
    c.setLineWidth(4 * s)
    c.line(x + 156 * s, y + 36 * s, x + 340 * s, y + 36 * s)
    c.setFillColor(dark)
    c.setFont("Helvetica-Bold", 10 * s)
    c.drawString(x + 157 * s, y + 19 * s, "An Aesthetic Water Villa")
    c.restoreState()


def footer(c: canvas.Canvas, page_no: int, label: str = "") -> None:
    c.saveState()
    c.setStrokeColor(colors.HexColor("#DBE8EE"))
    c.line(M, 24, W - M, 24)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(MUTED)
    c.drawString(M, 12, "FloatBoat demo system brochure")
    if label:
        c.drawCentredString(W / 2, 12, label)
    c.drawRightString(W - M, 12, f"{page_no:02d}")
    c.restoreState()


def page_bg(c: canvas.Canvas, color=PAPER) -> None:
    c.setFillColor(color)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def heading(c: canvas.Canvas, label: str, title: str, subtitle: str | None = None) -> None:
    pill(c, M, H - 62, label.upper(), bg=colors.HexColor("#DDF7FB"), fg=TEAL, size=8)
    draw_text(c, title, M, H - 100, 28, "Helvetica-Bold", DEEP)
    if subtitle:
        draw_wrapped(c, subtitle, M, H - 122, W - 2 * M, 10.5, 14, "Helvetica", MUTED, max_lines=2)


def browser_frame(c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str = "floatboat.demo") -> None:
    card(c, x, y, w, h, bg=WHITE, stroke=colors.HexColor("#CFE1E8"), radius=8, shadow=True)
    c.setFillColor(colors.HexColor("#EFF6F8"))
    c.roundRect(x + 1, y + h - 34, w - 2, 33, 8, fill=1, stroke=0)
    for i, col in enumerate([ROSE, AMBER, MINT]):
        c.setFillColor(col)
        c.circle(x + 17 + i * 15, y + h - 17, 4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.roundRect(x + 75, y + h - 26, w - 100, 16, 8, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(x + 86, y + h - 21, title)


def draw_stat(c: canvas.Canvas, x: float, y: float, w: float, label: str, value: str, color=TEAL) -> None:
    card(c, x, y, w, 66, bg=WHITE, stroke=colors.HexColor("#D8E8EE"), radius=8, shadow=False)
    c.setFillColor(color)
    c.roundRect(x + 12, y + 42, 30, 14, 7, fill=1, stroke=0)
    c.setFillColor(DEEP)
    c.setFont("Helvetica-Bold", 19)
    c.drawString(x + 12, y + 21, value)
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 12, y + 9, label.upper())


def cover(c: canvas.Canvas) -> None:
    page_bg(c, DEEP)
    draw_image_fill(c, ASSETS["hero"], 0, 0, W, H, "cover_hero", darken=0.50)
    c.saveState()
    c.setFillColor(NAVY)
    set_alpha(c, fill=0.52)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    set_alpha(c, fill=1)
    c.restoreState()
    logo(c, M, H - 125, scale=0.72, light=True)
    pill(c, W - 210, H - 78, "DEMO SYSTEM BROCHURE", bg=AMBER, fg=DEEP, size=8)
    draw_text(c, "Houseboat Website + Admin Platform", M, H - 210, 15, "Helvetica-Bold", CYAN)
    draw_wrapped(
        c,
        "A complete digital system for professional houseboat owners.",
        M,
        H - 258,
        540,
        42,
        48,
        "Helvetica-Bold",
        WHITE,
        max_lines=3,
    )
    draw_wrapped(
        c,
        "Guests discover the trip, choose cabins or packages, send booking requests, and contact on WhatsApp. Owners manage bookings, availability, rooms, content, payments, reports, promotions, and seasons from one admin panel.",
        M,
        H - 390,
        500,
        13,
        18,
        "Helvetica",
        colors.HexColor("#DFF7FA"),
        max_lines=5,
    )
    chips = [
        ("Guest website", "Hero, cabins, gallery, FAQ"),
        ("Booking flow", "Availability + request form"),
        ("Admin panel", "Operations and content control"),
        ("Business reports", "Revenue, expense, profit"),
    ]
    x = M
    for title, desc in chips:
        card(c, x, 58, 178, 72, bg=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#BFE5EA"), radius=8, shadow=False)
        draw_text(c, title, x + 14, 104, 12, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, x + 14, 86, 145, 8.5, 11, "Helvetica", MUTED, max_lines=2)
        x += 192
    draw_text(c, "Prepared as a client pitch asset", M, 32, 8.5, "Helvetica-Bold", colors.HexColor("#DFF7FA"))


def pitch_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Sales story", "The whole houseboat business in one link", "The PDF shows owners how the demo turns scattered inquiries into a professional booking and management workflow.")
    left_x, top_y = M, H - 185
    card(c, left_x, 70, 310, 365, bg=WHITE)
    draw_text(c, "What owners struggle with today", left_x + 20, 398, 16, "Helvetica-Bold", DEEP)
    pains = [
        "Guests ask the same questions again and again.",
        "Cabin, date, food, price and route details stay scattered.",
        "Booking status and advance payments are hard to track.",
        "Facebook or WhatsApp content does not feel premium enough.",
        "Owners cannot quickly see revenue, expense and profit.",
    ]
    yy = 365
    for idx, item in enumerate(pains, 1):
        c.setFillColor(colors.HexColor("#FEE2E2"))
        c.circle(left_x + 28, yy + 4, 10, fill=1, stroke=0)
        draw_text(c, str(idx), left_x + 25, yy, 8, "Helvetica-Bold", ROSE)
        yy = draw_wrapped(c, item, left_x + 46, yy + 2, 230, 10.5, 15, "Helvetica", SLATE, max_lines=2) - 10

    right_x = left_x + 340
    card(c, right_x, 70, W - right_x - M, 365, bg=colors.HexColor("#F0FCFE"), stroke=colors.HexColor("#BFEAF0"))
    draw_text(c, "How FloatBoat solves it", right_x + 22, 398, 16, "Helvetica-Bold", DEEP)
    steps = [
        ("Discover", "A premium branded website presents the boat, route, food, cabins, gallery and FAQs."),
        ("Choose", "Visitors compare cabins, packages and available dates before they contact."),
        ("Request", "Booking request captures guest info, date, room/package and special notes."),
        ("Confirm", "Admin reviews, tracks payments, updates status and blocks dates."),
        ("Measure", "Dashboard shows trips, guests, revenue, expenses, profit and reports."),
    ]
    y = 353
    for i, (label, desc) in enumerate(steps):
        x = right_x + 28 + i * 90
        c.setFillColor([TEAL, CYAN, AMBER, MINT, NAVY][i])
        c.circle(x, y, 18, fill=1, stroke=0)
        draw_text(c, str(i + 1), x - 4, y - 4, 12, "Helvetica-Bold", WHITE)
        if i < len(steps) - 1:
            c.setStrokeColor(colors.HexColor("#A6DCE4"))
            c.setLineWidth(2)
            c.line(x + 22, y, x + 68, y)
        draw_text(c, label, x - 26, y - 43, 10, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, x - 32, y - 62, 76, 7.2, 9.2, "Helvetica", MUTED, max_lines=4)
    collage_w = 118
    draw_image_fill(c, ASSETS["gallery_1"], right_x + 28, 100, collage_w, 130, "pitch_1", radius=8)
    draw_image_fill(c, ASSETS["gallery_2"], right_x + 168, 100, collage_w, 130, "pitch_2", radius=8)
    draw_image_fill(c, ASSETS["spot_2"], right_x + 308, 100, collage_w, 130, "pitch_3", radius=8)
    footer(c, 2, "Sales story")


def website_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Frontend", "A premium guest-facing website", "The first screen feels like a real houseboat brand, then moves guests into practical booking decisions.")
    bx, by, bw, bh = M, 78, 488, 385
    browser_frame(c, bx, by, bw, bh, "floatboat.com")
    inner_x, inner_y = bx + 14, by + 18
    draw_image_fill(c, ASSETS["hero"], inner_x, inner_y + 104, bw - 28, 225, "frontend_hero", darken=0.38, radius=6)
    logo(c, inner_x + 12, inner_y + 280, scale=0.34, light=True)
    nav = ["Cabins", "Itinerary", "Food", "Spots", "Gallery"]
    nx = inner_x + 245
    for item in nav:
        draw_text(c, item, nx, inner_y + 301, 6.8, "Helvetica-Bold", WHITE)
        nx += 39
    pill(c, inner_x + 24, inner_y + 242, "TANGUAR HAOR, SUNAMGANJ", bg=colors.HexColor("#FFFFFF"), fg=TEAL, size=7)
    draw_wrapped(c, "FloatBoat", inner_x + 24, inner_y + 198, 220, 32, 36, "Helvetica-Bold", WHITE, max_lines=1)
    draw_wrapped(c, "A Dream Night in Tanguar Haor", inner_x + 25, inner_y + 176, 250, 13, 16, "Helvetica-Bold", colors.HexColor("#DFF7FA"), max_lines=2)
    pill(c, inner_x + 24, inner_y + 137, "BOOK NOW", bg=AMBER, fg=DEEP, size=8)
    pill(c, inner_x + 122, inner_y + 137, "VIEW CABINS", bg=colors.HexColor("#ECFEFF"), fg=TEAL, size=8)
    sections = [
        ("Cabins", ASSETS["cabin_1"]),
        ("Food", ASSETS["gallery_3"]),
        ("Spots", ASSETS["spot_1"]),
        ("Gallery", ASSETS["gallery_4"]),
    ]
    sx = inner_x
    for label, img in sections:
        draw_image_fill(c, img, sx, inner_y, 107, 78, f"frontend_{label}", radius=6)
        c.setFillColor(DEEP)
        set_alpha(c, fill=0.52)
        c.roundRect(sx, inner_y, 107, 22, 6, fill=1, stroke=0)
        set_alpha(c, fill=1)
        draw_text(c, label, sx + 8, inner_y + 7, 8, "Helvetica-Bold", WHITE)
        sx += 116

    rx = bx + bw + 32
    draw_text(c, "What clients immediately understand", rx, 418, 17, "Helvetica-Bold", DEEP)
    features = [
        ("Premium hero and clear brand", "Logo, location badge, headline and primary CTA make the boat feel established."),
        ("Section-based storytelling", "Cabins, itinerary, food menu, tourist spots, gallery, facilities and FAQ are all visible."),
        ("Mobile-first experience", "Navigation, cards, booking form and WhatsApp action are designed for phone users."),
        ("Lead conversion", "Booking request and WhatsApp CTA reduce hesitation and help close faster."),
    ]
    y = 376
    for i, (title, desc) in enumerate(features):
        c.setFillColor([TEAL, AMBER, CYAN, MINT][i])
        c.roundRect(rx, y - 8, 28, 28, 8, fill=1, stroke=0)
        draw_text(c, str(i + 1), rx + 10, y, 10, "Helvetica-Bold", WHITE)
        draw_text(c, title, rx + 44, y + 6, 12, "Helvetica-Bold", DEEP)
        y = draw_wrapped(c, desc, rx + 44, y - 10, 245, 9.2, 12, "Helvetica", MUTED, max_lines=2) - 16
    card(c, rx, 88, 298, 82, bg=colors.HexColor("#FFF7E6"), stroke=colors.HexColor("#FBD58B"), radius=8, shadow=False)
    draw_text(c, "Pitch angle", rx + 18, 140, 11, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "Owners are not only buying a website. They are buying a more trustworthy first impression for every guest inquiry.", rx + 18, 121, 250, 9.2, 12.5, "Helvetica", SLATE, max_lines=3)
    footer(c, 3, "Frontend website")


def booking_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Bookings", "Cabins, packages and availability", "The demo makes it easy to explain room quality, pricing, date availability and booking request capture.")
    x = M
    rooms = [
        ("Panorama View", "2-3 guests", "Tk 11,000 / person", ASSETS["cabin_1"], TEAL),
        ("AC Attached Cabin", "2-3 guests", "Tk 12,000-14,000", ASSETS["cabin_2"], AMBER),
        ("Full Boat", "Family or team", "Custom package", ASSETS["cabin_3"], MINT),
    ]
    for i, (name, cap, price, img, col) in enumerate(rooms):
        w = 238
        y = 278
        card(c, x, y, w, 160, bg=WHITE, stroke=colors.HexColor("#D8E8EE"), radius=8)
        draw_image_fill(c, img, x + 10, y + 62, w - 20, 86, f"booking_room_{i}", radius=7)
        pill(c, x + 18, y + 124, "AVAILABLE", bg=col, fg=WHITE, size=7)
        draw_text(c, name, x + 14, y + 42, 13, "Helvetica-Bold", DEEP)
        draw_text(c, cap, x + 14, y + 24, 8.5, "Helvetica-Bold", MUTED)
        draw_text(c, price, x + 118, y + 24, 9.5, "Helvetica-Bold", TEAL)
        x += w + 24

    cal_x, cal_y = M, 78
    card(c, cal_x, cal_y, 358, 170, bg=WHITE, radius=8)
    draw_text(c, "Booking calendar", cal_x + 18, cal_y + 138, 14, "Helvetica-Bold", DEEP)
    draw_text(c, "Date status is visible before guests send a request.", cal_x + 18, cal_y + 119, 9, "Helvetica", MUTED)
    days = ["S", "M", "T", "W", "T", "F", "S"]
    start_x, start_y = cal_x + 28, cal_y + 88
    cell = 34
    for i, d in enumerate(days):
        draw_text(c, d, start_x + i * cell + 10, start_y + 34, 8, "Helvetica-Bold", MUTED)
    statuses = [0, 1, 0, 2, 0, 1, 0, 0, 0, 2, 1, 0, 0, 0]
    for i in range(14):
        row, col = divmod(i, 7)
        cx = start_x + col * cell
        cy = start_y - row * 36
        status = statuses[i]
        fill = [colors.HexColor("#ECFEFF"), colors.HexColor("#DCFCE7"), colors.HexColor("#FFE4E6")][status]
        stroke = [colors.HexColor("#BDEAF0"), colors.HexColor("#86EFAC"), colors.HexColor("#FDA4AF")][status]
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.roundRect(cx, cy, 28, 28, 6, fill=1, stroke=1)
        draw_text(c, str(i + 10), cx + 8, cy + 9, 8, "Helvetica-Bold", DEEP)
    pill(c, cal_x + 248, cal_y + 36, "Green: open", bg=colors.HexColor("#DCFCE7"), fg=colors.HexColor("#047857"), size=7)
    pill(c, cal_x + 248, cal_y + 12, "Red: booked", bg=colors.HexColor("#FFE4E6"), fg=ROSE, size=7)

    form_x = cal_x + 386
    card(c, form_x, cal_y, W - form_x - M, 170, bg=colors.HexColor("#F0FCFE"), stroke=colors.HexColor("#BFEAF0"), radius=8)
    draw_text(c, "Booking request captures", form_x + 18, cal_y + 138, 14, "Helvetica-Bold", DEEP)
    fields = ["Name and phone", "Trip date", "Cabin or full boat", "Guests", "Special request", "Payment note"]
    fx, fy = form_x + 18, cal_y + 102
    for idx, field in enumerate(fields):
        px = fx + (idx % 2) * 190
        py = fy - (idx // 2) * 38
        c.setFillColor(WHITE)
        c.roundRect(px, py, 158, 26, 6, fill=1, stroke=0)
        draw_text(c, field, px + 10, py + 9, 8.4, "Helvetica-Bold", SLATE)
    pill(c, form_x + 18, cal_y + 15, "SEND BOOKING REQUEST", bg=AMBER, fg=DEEP, size=8)
    footer(c, 4, "Cabins and booking flow")


def content_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Trip content", "Every section sells a different reason to book", "The brochure can show owners that the site is not empty decoration - it answers the questions guests ask before paying.")
    cols = 3
    gap = 18
    card_w = (W - 2 * M - gap * (cols - 1)) / cols
    card_h = 145
    items = [
        ("Itinerary", "2 days / 1 night route plan with time blocks, stops and safety notes.", ASSETS["spot_1"], TEAL),
        ("Food Menu", "Breakfast, lunch, snacks, dinner, BBQ and custom food arrangements.", ASSETS["gallery_3"], AMBER),
        ("Tourist Spots", "Tanguar Haor, Niladri Lake, Lakma Chara, Barikka Tila and Jadukata River.", ASSETS["spot_2"], CYAN),
        ("Facilities", "Safety gear, rooftop deck, AC cabins, washrooms, dining and crew support.", ASSETS["gallery_1"], MINT),
        ("Photo Gallery", "Real visual proof for social trust and premium presentation.", ASSETS["gallery_4"], TEAL),
        ("Guest Guidelines", "Rules, safety instructions and trip policies before confirmation.", ASSETS["gallery_2"], ROSE),
    ]
    for i, (title, desc, img, col) in enumerate(items):
        row, col_i = divmod(i, cols)
        x = M + col_i * (card_w + gap)
        y = H - 202 - row * (card_h + 22)
        card(c, x, y, card_w, card_h, bg=WHITE, radius=8)
        draw_image_fill(c, img, x + 10, y + 58, card_w - 20, 76, f"content_{i}", radius=7)
        c.setFillColor(col)
        c.roundRect(x + 18, y + 106, 34, 18, 9, fill=1, stroke=0)
        draw_text(c, f"{i + 1:02d}", x + 28, y + 112, 7.5, "Helvetica-Bold", WHITE)
        draw_text(c, title, x + 14, y + 36, 13, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, x + 14, y + 18, card_w - 28, 8.5, 10.5, "Helvetica", MUTED, max_lines=2)
    footer(c, 5, "Trip sections")


def conversion_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Conversion", "Trust signals and direct contact stay visible", "Gallery, reviews, FAQ and WhatsApp reduce friction for guests who are almost ready to book.")
    left_w = 468
    browser_frame(c, M, 90, left_w, 354, "floatboat.com/#gallery")
    ix, iy = M + 14, 108
    imgs = [ASSETS["gallery_1"], ASSETS["gallery_2"], ASSETS["gallery_3"], ASSETS["gallery_4"], ASSETS["spot_2"], ASSETS["spot_3"]]
    for i, img in enumerate(imgs):
        row, col = divmod(i, 3)
        draw_image_fill(c, img, ix + col * 145, iy + 160 - row * 116, 132, 100, f"conversion_gallery_{i}", radius=7)
    draw_text(c, "Photo and video gallery", ix, iy + 285, 15, "Helvetica-Bold", DEEP)
    draw_text(c, "Real trip visuals make the pitch easier to believe.", ix, iy + 267, 9.2, "Helvetica", MUTED)
    card(c, ix + 300, iy + 26, 125, 74, bg=colors.HexColor("#FFF7E6"), stroke=colors.HexColor("#FBD58B"), radius=8, shadow=False)
    draw_text(c, "WhatsApp", ix + 316, iy + 74, 12, "Helvetica-Bold", DEEP)
    draw_text(c, "floating CTA", ix + 316, iy + 56, 9, "Helvetica-Bold", TEAL)
    pill(c, ix + 315, iy + 30, "Chat now", bg=MINT, fg=WHITE, size=7)

    rx = M + left_w + 34
    draw_text(c, "Built-in persuasion sections", rx, 410, 17, "Helvetica-Bold", DEEP)
    blocks = [
        ("Reviews and testimonials", "Happy guest words from family, corporate, day-long and premium trips."),
        ("FAQ before contact", "Answers about overnight trips, food, safety, payment, cancellation and rooms."),
        ("Contact section", "Phone, WhatsApp, Facebook, email, location and map are presented clearly."),
        ("My Bookings", "Guests can check booking request status without calling repeatedly."),
    ]
    y = 367
    for i, (title, desc) in enumerate(blocks):
        card(c, rx, y - 54, 295, 66, bg=WHITE, radius=8, shadow=False)
        c.setFillColor([TEAL, AMBER, MINT, CYAN][i])
        c.roundRect(rx + 12, y - 34, 30, 30, 8, fill=1, stroke=0)
        draw_text(c, str(i + 1), rx + 22, y - 24, 10, "Helvetica-Bold", WHITE)
        draw_text(c, title, rx + 54, y - 12, 11.5, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, rx + 54, y - 29, 220, 8.2, 10.4, "Helvetica", MUTED, max_lines=2)
        y -= 82
    card(c, rx, 80, 295, 70, bg=colors.HexColor("#ECFEFF"), stroke=colors.HexColor("#BDEAF0"), radius=8, shadow=False)
    draw_text(c, "Pitch line", rx + 16, 126, 10, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "Clients receive one link that works like a digital salesperson, brochure and inquiry desk together.", rx + 16, 108, 250, 8.8, 11.5, "Helvetica", SLATE, max_lines=3)
    footer(c, 6, "Trust and conversion")


def admin_dashboard_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Admin", "Command center for the owner team", "The admin panel turns the website into an operating system for bookings, rooms, payments, trips and reports.")
    x, y, w, h = M, 70, W - 2 * M, 384
    card(c, x, y, w, h, bg=WHITE, stroke=colors.HexColor("#D8E8EE"), radius=8)
    side_w = 160
    c.setFillColor(colors.HexColor("#F3FAFC"))
    c.roundRect(x + 1, y + 1, side_w, h - 2, 8, fill=1, stroke=0)
    logo(c, x + 16, y + h - 93, scale=0.28, light=False)
    navs = ["Dashboard", "Bookings", "Trips", "Rooms", "Availability", "Gallery", "Reviews", "Payments", "Reports"]
    ny = y + h - 132
    for i, item in enumerate(navs):
        active = i == 0
        c.setFillColor(TEAL if active else colors.HexColor("#EAF4F7"))
        c.roundRect(x + 14, ny, side_w - 28, 24, 6, fill=1, stroke=0)
        draw_text(c, item, x + 28, ny + 8, 8, "Helvetica-Bold", WHITE if active else SLATE)
        ny -= 31
    main_x = x + side_w + 24
    draw_text(c, "Dashboard Overview", main_x, y + h - 48, 17, "Helvetica-Bold", DEEP)
    pill(c, main_x + 230, y + h - 55, "This month", bg=SKY, fg=TEAL, size=8)
    stat_w = 124
    stats = [("Total Trips", "12", TEAL), ("Guests", "84", AMBER), ("Revenue", "Tk 7.8L", MINT), ("Expense", "Tk 2.1L", ROSE)]
    sx = main_x
    for label, value, col in stats:
        draw_stat(c, sx, y + h - 132, stat_w, label, value, col)
        sx += stat_w + 15
    card(c, main_x, y + 44, 330, 165, bg=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#D8E8EE"), radius=8, shadow=False)
    draw_text(c, "Recent bookings", main_x + 16, y + 181, 12, "Helvetica-Bold", DEEP)
    rows = [("FLB-260521-001", "Rafiul Islam", "Confirmed", "Tk 8,500"), ("FLB-260604-002", "Sumaiya Khan", "Pending", "Tk 52,000"), ("FLB-260618-003", "Tanvir Ahmed", "Paid", "Tk 18,000")]
    ry = y + 153
    for code, name, status, amount in rows:
        c.setFillColor(WHITE)
        c.roundRect(main_x + 12, ry, 305, 28, 6, fill=1, stroke=0)
        draw_text(c, code, main_x + 22, ry + 10, 7.3, "Helvetica-Bold", TEAL)
        draw_text(c, name, main_x + 104, ry + 10, 7.3, "Helvetica", SLATE)
        draw_text(c, status, main_x + 205, ry + 10, 7.3, "Helvetica-Bold", MINT if status != "Pending" else AMBER)
        draw_text(c, amount, main_x + 260, ry + 10, 7.3, "Helvetica-Bold", DEEP)
        ry -= 36
    card(c, main_x + 354, y + 44, 210, 165, bg=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#D8E8EE"), radius=8, shadow=False)
    draw_text(c, "Profit trend", main_x + 370, y + 181, 12, "Helvetica-Bold", DEEP)
    base = y + 78
    points = [22, 44, 38, 70, 56, 92, 115]
    c.setStrokeColor(TEAL)
    c.setLineWidth(3)
    for i in range(len(points) - 1):
        c.line(main_x + 376 + i * 27, base + points[i], main_x + 376 + (i + 1) * 27, base + points[i + 1])
    for i, p in enumerate(points):
        c.setFillColor(AMBER if i == len(points) - 1 else TEAL)
        c.circle(main_x + 376 + i * 27, base + p, 4, fill=1, stroke=0)
    footer(c, 7, "Admin dashboard")


def operations_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Operations", "Admin modules cover the daily workload", "Each module is designed around the tasks houseboat owners and staff repeat every week.")
    modules = [
        ("Bookings", "Create, review, confirm, cancel, track guests and payment status."),
        ("Trips", "Trip schedule, manual bookings, guests, route notes and day-wise planning."),
        ("Padma Trip", "Day-long season workflow for Padma cruises and group bookings."),
        ("Rooms", "Cabin names, images, capacity, AC, washroom, price and status."),
        ("Availability", "Block booked dates, manage open dates and avoid double booking."),
        ("Gallery", "Upload and organize photos used across the public website."),
        ("Reviews", "Showcase guest reviews and synchronize Facebook review content."),
        ("Customers", "Keep customer records, notes and repeat booking history."),
        ("Packages", "Create trip packages with duration, route spots, meals and price."),
    ]
    cols = 3
    gap = 16
    cw = (W - 2 * M - gap * 2) / 3
    ch = 90
    for i, (title, desc) in enumerate(modules):
        row, col = divmod(i, cols)
        x = M + col * (cw + gap)
        y = H - 235 - row * (ch + 18)
        bg = WHITE if i % 2 else colors.HexColor("#F0FCFE")
        card(c, x, y, cw, ch, bg=bg, stroke=colors.HexColor("#D8E8EE"), radius=8, shadow=False)
        c.setFillColor([TEAL, AMBER, MINT, CYAN, ROSE][i % 5])
        c.roundRect(x + 14, y + 51, 30, 25, 7, fill=1, stroke=0)
        draw_text(c, title[:1], x + 24, y + 59, 10, "Helvetica-Bold", WHITE)
        draw_text(c, title, x + 56, y + 61, 12.5, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, x + 14, y + 36, cw - 28, 8.6, 11.2, "Helvetica", MUTED, max_lines=3)
    card(c, M, 54, W - 2 * M, 64, bg=colors.HexColor("#FFF7E6"), stroke=colors.HexColor("#FBD58B"), radius=8, shadow=False)
    draw_text(c, "Owner benefit", M + 18, 92, 12, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "Instead of keeping bookings in notebooks, photos in folders, payments in chats and expenses in memory, the owner gets one structured place to run the business.", M + 120, 93, W - 2 * M - 150, 10, 13, "Helvetica", SLATE, max_lines=2)
    footer(c, 8, "Operations modules")


def finance_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Finance", "Payments, income, expenses and reports", "Owners can pitch the system as a revenue-control dashboard, not only a website.")
    left_x, left_y = M, 82
    card(c, left_x, left_y, 430, 355, bg=WHITE, radius=8)
    draw_text(c, "Finance dashboard mockup", left_x + 20, left_y + 320, 16, "Helvetica-Bold", DEEP)
    draw_stat(c, left_x + 20, left_y + 238, 120, "Revenue", "Tk 7.8L", MINT)
    draw_stat(c, left_x + 154, left_y + 238, 120, "Expense", "Tk 2.1L", ROSE)
    draw_stat(c, left_x + 288, left_y + 238, 120, "Profit", "Tk 5.7L", TEAL)
    c.setStrokeColor(colors.HexColor("#D8E8EE"))
    c.line(left_x + 24, left_y + 196, left_x + 398, left_y + 196)
    bars = [78, 112, 90, 145, 120, 168]
    for i, b in enumerate(bars):
        bx = left_x + 42 + i * 54
        c.setFillColor(colors.HexColor("#CFFAFE"))
        c.roundRect(bx, left_y + 52, 22, 126, 6, fill=1, stroke=0)
        c.setFillColor(TEAL if i < 5 else AMBER)
        c.roundRect(bx, left_y + 52, 22, b, 6, fill=1, stroke=0)
        draw_text(c, f"W{i + 1}", bx - 2, left_y + 31, 7.5, "Helvetica-Bold", MUTED)
    draw_text(c, "Weekly booking revenue", left_x + 42, left_y + 178, 10, "Helvetica-Bold", SLATE)

    rx = left_x + 462
    sections = [
        ("Payments", "Advance, due, paid amount, transaction note and payment status."),
        ("Income", "Additional income beyond bookings, with date and category."),
        ("Expenses", "Fuel, food, crew, maintenance and trip-wise operating cost."),
        ("Reports", "Date filtered tables and charts for revenue, expense and profit."),
        ("Promo discounts", "Special dates and promotional rules for campaigns."),
    ]
    y = 400
    for i, (title, desc) in enumerate(sections):
        card(c, rx, y - 56, 300, 64, bg=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#D8E8EE"), radius=8, shadow=False)
        c.setFillColor([MINT, TEAL, ROSE, AMBER, CYAN][i])
        c.circle(rx + 25, y - 25, 15, fill=1, stroke=0)
        draw_text(c, str(i + 1), rx + 21, y - 29, 10, "Helvetica-Bold", WHITE)
        draw_text(c, title, rx + 52, y - 14, 12, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, rx + 52, y - 31, 220, 8.4, 10.5, "Helvetica", MUTED, max_lines=2)
        y -= 72
    footer(c, 9, "Finance and reports")


def season_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Customization", "Season, brand and content control", "The same platform can be pitched as a reusable system for different boats, seasons and offers.")
    draw_image_fill(c, ASSETS["spot_1"], M, 268, 250, 150, "season_haor", radius=8)
    draw_image_fill(c, ASSETS["spot_4"], M + 270, 268, 250, 150, "season_padma", radius=8)
    pill(c, M + 18, 384, "HAOR SEASON", bg=TEAL, fg=WHITE, size=8)
    pill(c, M + 288, 384, "PADMA DAY LONG", bg=AMBER, fg=DEEP, size=8)
    card(c, M + 540, 268, W - M - (M + 540), 150, bg=WHITE, radius=8)
    draw_text(c, "Settings owners can change", M + 560, 390, 14, "Helvetica-Bold", DEEP)
    settings = ["Logo and brand name", "Phone, WhatsApp, Facebook", "Prices and packages", "Rooms and gallery", "Active season", "Website content"]
    sx, sy = M + 560, 360
    for i, item in enumerate(settings):
        px = sx + (i % 2) * 138
        py = sy - (i // 2) * 33
        c.setFillColor(colors.HexColor("#ECFEFF"))
        c.roundRect(px, py, 124, 24, 6, fill=1, stroke=0)
        draw_text(c, item, px + 9, py + 8, 7.5, "Helvetica-Bold", TEAL)

    card(c, M, 80, 370, 150, bg=colors.HexColor("#F0FCFE"), stroke=colors.HexColor("#BFEAF0"), radius=8)
    draw_text(c, "Brandable for every owner", M + 20, 194, 15, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "Replace FloatBoat with the owner's houseboat name, logo, images, colors, contact numbers, room details and pricing. The demo becomes their own sales system.", M + 20, 165, 318, 10.5, 14, "Helvetica", SLATE, max_lines=5)
    card(c, M + 400, 80, W - 2 * M - 400, 150, bg=colors.HexColor("#FFF7E6"), stroke=colors.HexColor("#FBD58B"), radius=8)
    draw_text(c, "One platform, multiple offers", M + 420, 194, 15, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "Haor overnight tours, Padma day-long cruises, family trips, corporate events, birthday decoration and custom food menus can all be packaged as separate sales angles.", M + 420, 165, W - 2 * M - 450, 10.5, 14, "Helvetica", SLATE, max_lines=5)
    footer(c, 10, "Brand and season control")


def value_page(c: canvas.Canvas) -> None:
    page_bg(c)
    heading(c, "Business value", "Why houseboat owners will care", "The pitch should connect features to outcomes: more trust, fewer manual tasks and clearer numbers.")
    values = [
        ("More premium first impression", "A professional website makes the boat feel established before the first phone call."),
        ("Faster inquiry to booking", "Guests see cabins, route, food, availability and WhatsApp without asking five separate questions."),
        ("Less manual coordination", "Staff can manage bookings, dates, room status, gallery and customer notes from admin."),
        ("Clearer business numbers", "Revenue, expense, profit, payments and reports help owners understand each season."),
    ]
    for i, (title, desc) in enumerate(values):
        x = M + (i % 2) * 386
        y = 298 - (i // 2) * 144
        card(c, x, y, 360, 112, bg=WHITE, radius=8)
        c.setFillColor([TEAL, AMBER, MINT, CYAN][i])
        c.roundRect(x + 18, y + 64, 40, 32, 8, fill=1, stroke=0)
        draw_text(c, str(i + 1), x + 32, y + 75, 12, "Helvetica-Bold", WHITE)
        draw_text(c, title, x + 74, y + 80, 14, "Helvetica-Bold", DEEP)
        draw_wrapped(c, desc, x + 74, y + 56, 246, 9.8, 13, "Helvetica", MUTED, max_lines=3)
    card(c, M, 72, W - 2 * M, 90, bg=DEEP, stroke=DEEP, radius=8, shadow=False)
    logo(c, M + 20, 91, scale=0.36, light=True)
    draw_text(c, "Pitch package", M + 225, 126, 14, "Helvetica-Bold", WHITE)
    draw_wrapped(c, "Branded website, admin dashboard, booking workflow, gallery/content setup, season configuration, reporting module and launch handover.", M + 225, 106, 500, 10.3, 14, "Helvetica", colors.HexColor("#DFF7FA"), max_lines=2)
    footer(c, 11, "Business value")


def closing_page(c: canvas.Canvas) -> None:
    page_bg(c, DEEP)
    draw_image_fill(c, ASSETS["gallery_4"], 0, 0, W, H, "closing_bg", darken=0.62)
    c.saveState()
    c.setFillColor(NAVY)
    set_alpha(c, fill=0.62)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    set_alpha(c, fill=1)
    c.restoreState()
    logo(c, M, H - 125, scale=0.72, light=True)
    draw_wrapped(c, "Ready to turn guest inquiries into confirmed trips.", M, H - 250, 560, 40, 46, "Helvetica-Bold", WHITE, max_lines=2)
    draw_wrapped(c, "FloatBoat is a pitch-ready demo for houseboat owners: a premium public website, booking funnel, admin panel, finance reports and brand customization in one system.", M, H - 330, 560, 13, 18, "Helvetica", colors.HexColor("#DFF7FA"), max_lines=4)
    card(c, M, 92, 420, 92, bg=colors.HexColor("#F8FAFC"), stroke=colors.HexColor("#BFE5EA"), radius=8, shadow=False)
    draw_text(c, "Send this PDF to a client and they can understand:", M + 18, 151, 11, "Helvetica-Bold", DEEP)
    draw_wrapped(c, "what the website shows, what the admin controls, how bookings flow, and why the system helps them sell more professionally.", M + 18, 130, 370, 10, 13, "Helvetica", SLATE, max_lines=3)
    pill(c, W - 250, 112, "FLOATBOAT DEMO SYSTEM", bg=AMBER, fg=DEEP, size=9)
    draw_text(c, "Website + Booking + Admin + Reports", W - 266, 92, 10, "Helvetica-Bold", colors.HexColor("#DFF7FA"))


def render_previews(pdf_path: Path) -> None:
    for item in SCREEN_DIR.glob("page-*.png"):
        item.unlink()
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.25, 1.25), alpha=False)
        pix.save(SCREEN_DIR / f"page-{i + 1:02d}.png")
    doc.close()


def build_pdf() -> None:
    ensure_dirs()
    c = canvas.Canvas(str(PDF_PATH), pagesize=PAGE, pageCompression=1)
    c.setTitle("FloatBoat Demo System Brochure")
    c.setAuthor("FloatBoat")
    cover(c)
    c.showPage()
    pitch_page(c)
    c.showPage()
    website_page(c)
    c.showPage()
    booking_page(c)
    c.showPage()
    content_page(c)
    c.showPage()
    conversion_page(c)
    c.showPage()
    admin_dashboard_page(c)
    c.showPage()
    operations_page(c)
    c.showPage()
    finance_page(c)
    c.showPage()
    season_page(c)
    c.showPage()
    value_page(c)
    c.showPage()
    closing_page(c)
    c.save()
    render_previews(PDF_PATH)


if __name__ == "__main__":
    build_pdf()
    print(PDF_PATH)
    print(SCREEN_DIR)
