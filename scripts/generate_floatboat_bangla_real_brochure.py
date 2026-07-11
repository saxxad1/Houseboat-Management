from __future__ import annotations

import html
import shutil
from pathlib import Path

import fitz
from PIL import Image
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
WORK_DIR = ROOT / "tmp" / "pdfs" / "floatboat-real-brochure"
SHOT_DIR = WORK_DIR / "screenshots"
IMG_DIR = WORK_DIR / "pdf-images"
RENDER_DIR = WORK_DIR / "rendered"
OUT_DIR = ROOT / "output" / "pdf"
PDF_PATH = OUT_DIR / "floatboat-client-brochure-bangla.pdf"
HTML_PATH = WORK_DIR / "floatboat-client-brochure-bangla.html"
DOWNLOAD_REPLACE_PATH = Path.home() / "Downloads" / "floatboat-demo-system-brochure.pdf"
DOWNLOAD_NAMED_PATH = Path.home() / "Downloads" / "floatboat-client-brochure-bangla.pdf"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def prepare_image(name: str, max_width: int = 1800) -> str:
    src = SHOT_DIR / f"{name}.png"
    if not src.exists():
        raise FileNotFoundError(src)

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    dest = IMG_DIR / f"{name}.jpg"
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        return dest.resolve().as_uri()

    im = Image.open(src).convert("RGB")
    if im.width > max_width:
        h = int(im.height * max_width / im.width)
        im = im.resize((max_width, h), Image.Resampling.LANCZOS)
    im.save(dest, quality=88, optimize=True)
    return dest.resolve().as_uri()


def bullet(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{esc(item)}</li>" for item in items) + "</ul>"


def shot(name: str, caption: str = "", klass: str = "") -> str:
    cap = f"<div class='caption'>{esc(caption)}</div>" if caption else ""
    return f"""
    <figure class="shot {klass}">
      <img src="{prepare_image(name)}" alt="{esc(caption or name)}">
      {cap}
    </figure>
    """


def panel(title: str, body: str, items: list[str], tag: str = "") -> str:
    tag_html = f"<div class='eyebrow'>{esc(tag)}</div>" if tag else ""
    return f"""
    <section class="copy-panel">
      {tag_html}
      <h2>{esc(title)}</h2>
      <p>{esc(body)}</p>
      {bullet(items)}
    </section>
    """


def page(title: str, subtitle: str, body: str, number: int) -> str:
    return f"""
    <section class="page">
      {body}
      <footer><span>FloatBoat ক্লায়েন্ট ব্রোশার</span><span>পৃষ্ঠা {number:02d}</span></footer>
    </section>
    """


def cover(number: int) -> str:
    return f"""
    <section class="page cover">
      <img class="cover-bg" src="{prepare_image('public-hero')}" alt="FloatBoat homepage screenshot">
      <div class="cover-shade"></div>
      <div class="cover-content">
        <div class="badge">লাইভ ডেমো স্ক্রিনশট দিয়ে তৈরি</div>
        <h1>FloatBoat ওয়েবসাইট ও অ্যাডমিন ম্যানেজমেন্ট সিস্টেম</h1>
        <p>টাঙ্গুয়ার হাওরের হাউসবোট মালিকদের কাছে প্রফেশনালভাবে পিচ করার জন্য একটি বাংলা ব্রোশার।</p>
        <div class="cover-grid">
          <div><b>ফ্রন্টএন্ড ওয়েবসাইট</b><span>হিরো, কেবিন, গ্যালারি, প্রশ্নোত্তর, যোগাযোগ</span></div>
          <div><b>বুকিং ফ্লো</b><span>ক্যালেন্ডার, রিকোয়েস্ট ফর্ম, পেমেন্ট অপশন</span></div>
          <div><b>অ্যাডমিন প্যানেল</b><span>বুকিং, রুম, ট্রিপ, রিপোর্ট, সেটিংস</span></div>
        </div>
      </div>
      <footer class="light"><span>FloatBoat ক্লায়েন্ট ব্রোশার</span><span>পৃষ্ঠা {number:02d}</span></footer>
    </section>
    """


def two_col_page(
    number: int,
    tag: str,
    title: str,
    intro: str,
    image_name: str,
    caption: str,
    bullets: list[str],
    benefit: str,
) -> str:
    body = f"""
    <div class="page-head">
      <div class="eyebrow">{esc(tag)}</div>
      <h1>{esc(title)}</h1>
      <p>{esc(intro)}</p>
    </div>
    <div class="two-col">
      {shot(image_name, caption, "main-shot")}
      {panel("এই সেকশনে কী আছে", benefit, bullets, "ক্লায়েন্টকে বোঝানোর পয়েন্ট")}
    </div>
    """
    return page(title, intro, body, number)


def grid_page(number: int, tag: str, title: str, intro: str, shots: list[tuple[str, str]], items: list[str]) -> str:
    shots_html = "".join(shot(name, caption, "grid-shot") for name, caption in shots)
    body = f"""
    <div class="page-head compact">
      <div class="eyebrow">{esc(tag)}</div>
      <h1>{esc(title)}</h1>
      <p>{esc(intro)}</p>
    </div>
    <div class="grid-layout">
      <div class="shot-grid">{shots_html}</div>
      {panel("এগুলো কেন গুরুত্বপূর্ণ", intro, items, "পিচ নোট")}
    </div>
    """
    return page(title, intro, body, number)


def build_html() -> str:
    pages: list[str] = []
    n = 1
    pages.append(cover(n)); n += 1

    overview = f"""
    <div class="page-head">
      <div class="eyebrow">ওভারভিউ</div>
      <h1>একটি হাউসবোটের জন্য সম্পূর্ণ ডিজিটাল সেলস ও অপারেশন সিস্টেম</h1>
      <p>এই ব্রোশারের প্রতিটি ভিজ্যুয়াল FloatBoat ডেমো ওয়েবসাইট ও অ্যাডমিন প্যানেল থেকে নেওয়া বাস্তব স্ক্রিনশট।</p>
    </div>
    <div class="overview-grid">
      {shot('public-hero', 'ওয়েবসাইটের প্রথম impression')}
      {shot('admin-dashboard', 'অ্যাডমিন ড্যাশবোর্ড')}
      {shot('public-mobile-home', 'মোবাইল ভিউ')}
    </div>
    <div class="value-strip">
      <div><b>বিশ্বাস তৈরি</b><span>ক্লায়েন্ট প্রথমেই প্রফেশনাল ব্র্যান্ড অনুভব করবে।</span></div>
      <div><b>বুকিং সহজ</b><span>তারিখ, কেবিন, গেস্ট, পেমেন্ট অপশন এক জায়গায়।</span></div>
      <div><b>ম্যানেজমেন্ট সহজ</b><span>অ্যাডমিন থেকে কন্টেন্ট, বুকিং, হিসাব ও রিপোর্ট কন্ট্রোল।</span></div>
      <div><b>স্কেল করা যায়</b><span>একই সিস্টেম অন্য হাউসবোটের ব্র্যান্ডে কাস্টমাইজ করা যাবে।</span></div>
    </div>
    """
    pages.append(page("ওভারভিউ", "", overview, n)); n += 1

    pages.append(two_col_page(
        n,
        "ফ্রন্টএন্ড",
        "হিরো সেকশন ও প্রথম ধারণা",
        "ওয়েবসাইটে ঢুকেই ক্লায়েন্ট ব্র্যান্ড, লোকেশন, বুকিং বাটন এবং মূল ট্রিপ ভ্যালু বুঝতে পারে।",
        "public-hero",
        "লাইভ ওয়েবসাইটের হিরো, নেভিগেশন, ফোন নম্বর ও বুকিং বাটন",
        [
            "লোগো, নেভিগেশন, ফোন নম্বর এবং বুকিং বাটন প্রথম স্ক্রিনেই থাকে।",
            "লোকেশন ব্যাজ, ট্রিপ সময়, ধারণক্ষমতা এবং রুম সংখ্যা দ্রুত বিশ্বাস তৈরি করে।",
            "ক্লায়েন্ট সরাসরি কেবিন দেখবে বা বুকিং action নিতে পারবে।",
        ],
        "হাউসবোট মালিককে বোঝানো যায় যে এটি শুধু ছবি নয়, এটি একটি conversion-focused sales page।",
    )); n += 1

    pages.append(two_col_page(
        n,
        "ফ্রন্টএন্ড",
        "পরিচিতি সেকশন",
        "এই অংশে হাউসবোটের গল্প, অভিজ্ঞতা, সেফটি, ফ্যামিলি বা কর্পোরেট suitability তুলে ধরা হয়।",
        "public-about",
        "FloatBoat সম্পর্কে লাইভ সেকশন",
        [
            "ব্র্যান্ডের গল্প এবং destination context এক জায়গায় থাকে।",
            "Happy tourists, safety, dining, comfort, scenic view - এগুলো trust signal হিসেবে কাজ করে।",
            "নতুন visitor দ্রুত বুঝতে পারে এই boat কার জন্য suitable।",
        ],
        "মালিকদের জন্য এই সেকশন তাদের boat-কে generic listing থেকে আলাদা premium brand হিসেবে দেখায়।",
    )); n += 1

    pages.append(two_col_page(
        n,
        "ফ্রন্টএন্ড",
        "কেবিন / রুম সেকশন",
        "ক্লায়েন্টরা কেবিনের ছবি, ধরন, ধারণক্ষমতা, মূল্য এবং সুবিধা দেখে সিদ্ধান্ত নিতে পারে।",
        "public-cabins",
        "কেবিন কার্ড, মূল্য, সুবিধা এবং বুকিং action",
        [
            "প্রতিটি রুম/কেবিন আলাদা ছবি, ধরন, মূল্য এবং সুবিধা দিয়ে দেখানো যায়।",
            "AC, private bath, food included, ধারণক্ষমতা ইত্যাদি পরিষ্কারভাবে visible থাকে।",
            "কেবিনভিত্তিক বুকিং এবং পুরো boat বুকিং দুটো option বোঝানো যায়।",
        ],
        "WhatsApp-এ বারবার মূল্য ও রুমের ছবি পাঠানোর প্রয়োজন কমে যায়।",
    )); n += 1

    pages.append(grid_page(
        n,
        "বুকিং ফ্লো",
        "তারিখ ক্যালেন্ডার ও বুকিং রিকোয়েস্ট",
        "Guest আগে তারিখের availability দেখে, এরপর বুকিং রিকোয়েস্ট ফর্ম দিয়ে নিজের তথ্য পাঠাতে পারে।",
        [
            ("public-availability", "বুকিং ক্যালেন্ডার - কোন তারিখ open বা booked তা দেখা যায়"),
            ("public-booking-modal", "বুকিং রিকোয়েস্ট ফর্ম - রুম, guest, তারিখ, পেমেন্ট অপশন"),
        ],
        [
            "ডাবল বুকিং কমানোর জন্য তারিখের status পরিষ্কার থাকে।",
            "নাম, ফোন, check-in, check-out, রুম, guest সংখ্যা, পেমেন্ট method এবং transaction note নেওয়া যায়।",
            "Estimated total দেখানোর কারণে guest আগেই budget idea পায়।",
            "মালিক/অ্যাডমিন পরবর্তীতে রিকোয়েস্ট review করে confirm করতে পারে।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "ট্রিপ কনটেন্ট",
        "ভ্রমণ পরিকল্পনা ও খাবারের মেনু",
        "হাউসবোট বুকিংয়ের আগে guest সাধারণত route, সময়সূচি, খাবার এবং included item জানতে চায়।",
        [
            ("public-itinerary", "দিনভিত্তিক travel plan এবং route timeline"),
            ("public-food-menu", "Meal plan, breakfast, lunch, dinner এবং custom food note"),
        ],
        [
            "Trip plan আগেই visible থাকলে guest expectation পরিষ্কার হয়।",
            "খাবারের মেনু সুন্দরভাবে থাকলে package value বেশি premium মনে হয়।",
            "Custom arrangement action দিয়ে বড় group বা corporate client conversion করা সহজ হয়।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "ডেস্টিনেশন ও সুবিধা",
        "ট্যুরিস্ট স্পট ও সুবিধাসমূহ",
        "হাউসবোট trip কোথায় যাবে এবং boat-এ কী সুবিধা থাকবে, এই দুই প্রশ্নের উত্তর এখানে দেওয়া হয়।",
        [
            ("public-destinations", "টাঙ্গুয়ার হাওর, নিলাদ্রি, বারিক্কা টিলা, জাদুকাটা route spot"),
            ("public-facilities", "সেফটি, rooftop, dining, washroom, crew support সুবিধা"),
        ],
        [
            "Destination cardগুলো trip value visually বাড়ায়।",
            "সুবিধাসমূহ সেকশন safety এবং comfort নিয়ে uncertainty কমায়।",
            "হাউসবোট মালিক তার boat-এর unique সুবিধা সহজে showcase করতে পারে।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "ট্রাস্ট বিল্ডিং",
        "ফটো গ্যালারি ও রিভিউ",
        "Real photo এবং guest review potential client-কে প্রমাণ দেখায় যে trip experience credible।",
        [
            ("public-gallery", "ফটো গ্যালারি - real room, deck, trip moment এবং lifestyle image"),
            ("public-reviews", "Guest testimonial এবং rating summary"),
        ],
        [
            "Gallery visual proof হিসেবে কাজ করে।",
            "রিভিউ নতুন guest-এর decision confidence বাড়ায়।",
            "Photo + review একসাথে থাকলে page-টি Facebook post-এর চেয়ে বেশি professional লাগে।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "সাপোর্ট কনটেন্ট",
        "প্রশ্নোত্তর, গাইডলাইন, যোগাযোগ ও আমার বুকিং",
        "বারবার করা প্রশ্ন, trip rule, যোগাযোগ এবং বুকিং status check - সব support content এক জায়গায় থাকে।",
        [
            ("public-faq", "প্রশ্নোত্তর - common প্রশ্নের উত্তর"),
            ("public-guest-guidelines", "Guest guideline এবং safety rule"),
            ("public-contact", "Phone, WhatsApp, email, Facebook and location"),
            ("public-my-bookings", "Guest booking status check page"),
        ],
        [
            "প্রশ্নোত্তর থাকলে repeated phone question কমে।",
            "Guideline থাকলে trip rule আগে থেকেই clear থাকে।",
            "যোগাযোগ সেকশন guest-কে call, WhatsApp, email, Facebook সব option দেয়।",
            "আমার বুকিং page guest-কে রিকোয়েস্ট status check করতে সাহায্য করে।",
        ],
    )); n += 1

    pages.append(two_col_page(
        n,
        "মোবাইল অভিজ্ঞতা",
        "মোবাইল ভিউ ও floating WhatsApp",
        "বাংলাদেশের বেশিরভাগ guest মোবাইল থেকে browse করে, তাই mobile view pitch-এর বড় অংশ।",
        "public-mobile-home",
        "মোবাইল হোম স্ক্রিন, বুকিং action এবং WhatsApp support",
        [
            "Small screen-এ লোগো, হিরো, বুকিং action এবং stats readable থাকে।",
            "Floating WhatsApp দ্রুত inquiry conversion-এ সাহায্য করে।",
            "মোবাইল responsive হওয়ায় Facebook/WhatsApp থেকে পাঠানো link সরাসরি কাজ করে।",
        ],
        "মালিককে বোঝানো যায় যে এই সিস্টেম বাস্তবে phone-first customer journey-এর জন্য তৈরি।",
    )); n += 1

    pages.append(two_col_page(
        n,
        "অ্যাডমিন",
        "ড্যাশবোর্ড ওভারভিউ",
        "অ্যাডমিন dashboard থেকে মালিক booking, guest, revenue, expense, profit এবং recent activity এক নজরে দেখতে পারে।",
        "admin-dashboard",
        "FloatBoat অ্যাডমিন dashboard live screenshot",
        [
            "Date filter দিয়ে নির্দিষ্ট সময়ের performance দেখা যায়।",
            "Total trips, guests, revenue, expense এবং profit summary থাকে।",
            "সাম্প্রতিক booking এবং expense দ্রুত review করা যায়।",
        ],
        "এটি মালিককে business health বুঝতে সাহায্য করে, শুধু ওয়েবসাইট নয় - পুরো অপারেশন কন্ট্রোল দেয়।",
    )); n += 1

    pages.append(grid_page(
        n,
        "অ্যাডমিন",
        "বুকিং ম্যানেজমেন্ট ও তারিখ কন্ট্রোল",
        "অ্যাডমিন থেকে booking request, customer details, payment status এবং date availability manage করা যায়।",
        [
            ("admin-bookings", "বুকিং ম্যানেজমেন্ট টেবিল"),
            ("admin-availability", "অ্যাডমিন বুকিং ক্যালেন্ডার"),
        ],
        [
            "Pending, confirmed, paid বা cancelled status update করা যায়।",
            "Guest সংখ্যা, amount, advance, due এবং booking date track করা যায়।",
            "Calendar view মালিককে কোন date booked বা open তা দ্রুত দেখায়।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "অ্যাডমিন",
        "ট্রিপ, রুম/কেবিন ও Padma Trip",
        "Season অনুযায়ী trip slot, rooms, package এবং Padma day-long configuration আলাদাভাবে manage করা যায়।",
        [
            ("admin-trips", "ট্রিপ ম্যানেজমেন্ট"),
            ("admin-rooms", "রুম/কেবিন ম্যানেজমেন্ট"),
            ("admin-padma-trip", "Padma trip configuration"),
        ],
        [
            "Trip schedule, manual booking, guest এবং income-expense note রাখা যায়।",
            "রুম/কেবিন থেকে image, capacity, price, AC, washroom, status control করা যায়।",
            "Padma day-long cruise-এর আলাদা price ও trip details manage করা যায়।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "অ্যাডমিন",
        "হিসাব, ডিসকাউন্ট ও রিপোর্ট",
        "হাউসবোট মালিকের জন্য income, expense, payment, discount এবং profit report একটি বড় selling point।",
        [
            ("admin-income", "Income tracking"),
            ("admin-expenses", "Expense tracking"),
            ("admin-reports", "রিপোর্ট dashboard"),
            ("admin-discount", "ডিসকাউন্ট settings"),
        ],
        [
            "Booking income ছাড়াও extra income আলাদা category-তে রাখা যায়।",
            "Food, fuel, staff, maintenance, marketing expense track করা যায়।",
            "রিপোর্ট থেকে revenue, due, expense এবং profit বুঝতে সুবিধা হয়।",
            "ডিসকাউন্ট settings দিয়ে weekday/full moon/holiday offer control করা যায়।",
        ],
    )); n += 1

    pages.append(grid_page(
        n,
        "অ্যাডমিন",
        "কন্টেন্ট, গ্যালারি, রিভিউ, season ও সেটিংস",
        "ওয়েবসাইটের public content এবং brand settings মালিক নিজেই control করতে পারে।",
        [
            ("admin-gallery", "ওয়েবসাইট গ্যালারি ম্যানেজমেন্ট"),
            ("admin-reviews", "রিভিউ ম্যানেজমেন্ট"),
            ("admin-season-settings", "Haor/Padma season mode"),
            ("admin-settings", "Houseboat settings"),
            ("admin-customers", "Customer records"),
        ],
        [
            "গ্যালারি থেকে public website-এর ছবি update করা যায়।",
            "রিভিউ add/edit করে social proof control করা যায়।",
            "Season Mode দিয়ে Haor বা Padma offering switch করা যায়।",
            "সেটিংস থেকে brand, contact, payment এবং houseboat details update করা যায়।",
            "Customer section future follow-up এবং repeat booking-এর জন্য helpful।",
        ],
    )); n += 1

    final_body = f"""
    <div class="final-layout">
      <div>
        <div class="eyebrow">ক্লায়েন্ট পিচ</div>
        <h1>হাউসবোট মালিককে কীভাবে বোঝাবেন</h1>
        <p>এই সিস্টেমটি তাদের জন্য একটি প্রফেশনাল ওয়েবসাইট, বুকিং funnel, অ্যাডমিন প্যানেল এবং business reporting system - সব একসাথে।</p>
        {bullet([
            "Guest একই link-এ boat, room, route, food, gallery, প্রশ্নোত্তর এবং contact বুঝে যাবে।",
            "মালিক একই admin panel থেকে booking, availability, content, payment, income, expense এবং report manage করবে।",
            "প্রতিটি houseboat-এর name, logo, image, color, price এবং contact দিয়ে আলাদা brand তৈরি করা যাবে।",
            "এটি demo হিসেবে দেখিয়ে সহজে বোঝানো যায় যে website-টি শুধু online presence নয়, sales এবং operation দুটোই handle করবে।",
        ])}
        <div class="cta-box">
          <b>পিচ লাইন:</b>
          <span>“আপনার হাউসবোটের জন্য এমন একটি system, যেটা customer আনবে, booking organize করবে এবং business number পরিষ্কার রাখবে।”</span>
        </div>
      </div>
      <div class="final-shots">
        {shot('public-hero', 'Guest-facing ওয়েবসাইট')}
        {shot('admin-dashboard', 'মালিকের জন্য অ্যাডমিন প্যানেল')}
      </div>
    </div>
    """
    pages.append(page("ক্লায়েন্ট পিচ", "", final_body, n)); n += 1

    css = """
    <style>
      @page { size: A4 landscape; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #e7f2f5;
        color: #0b3142;
        font-family: "Bangla Sangam MN", "Bangla MN", "Noto Sans Bengali", "Hind Siliguri", Arial, sans-serif;
      }
      .page {
        position: relative;
        width: 297mm;
        height: 210mm;
        padding: 12mm 13mm 13mm;
        overflow: hidden;
        page-break-after: always;
        background: #f8fbfc;
      }
      .page-head { margin-bottom: 7mm; }
      .page-head.compact { margin-bottom: 5mm; }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        min-height: 7mm;
        padding: 1.4mm 4mm;
        border-radius: 99px;
        background: #d9f7fb;
        color: #087185;
        font-weight: 800;
        font-size: 9.5pt;
      }
      h1 {
        margin: 4mm 0 2mm;
        max-width: 230mm;
        color: #062a35;
        font-size: 25pt;
        line-height: 1.15;
        letter-spacing: 0;
      }
      h2 {
        margin: 2mm 0 3mm;
        color: #062a35;
        font-size: 18pt;
        line-height: 1.2;
      }
      p {
        margin: 0;
        color: #446176;
        font-size: 12pt;
        line-height: 1.45;
      }
      ul {
        margin: 5mm 0 0;
        padding: 0;
        list-style: none;
      }
      li {
        position: relative;
        margin: 0 0 3.2mm;
        padding-left: 7mm;
        color: #22384a;
        font-size: 11.2pt;
        line-height: 1.38;
      }
      li::before {
        content: "";
        position: absolute;
        left: 0;
        top: 2.2mm;
        width: 3.2mm;
        height: 3.2mm;
        border-radius: 50%;
        background: #0e7490;
      }
      footer {
        position: absolute;
        left: 13mm;
        right: 13mm;
        bottom: 5mm;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #d8e8ee;
        padding-top: 2mm;
        color: #678094;
        font-size: 8.5pt;
        font-weight: 700;
      }
      footer.light { color: #d8f7fb; border-color: rgba(255,255,255,.25); }
      .cover { padding: 0; background: #062a35; color: white; }
      .cover-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover-shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(6,42,53,.92), rgba(6,42,53,.68), rgba(6,42,53,.28));
      }
      .cover-content {
        position: relative;
        z-index: 2;
        width: 178mm;
        padding: 20mm 0 0 16mm;
      }
      .badge {
        display: inline-flex;
        padding: 2mm 5mm;
        border-radius: 999px;
        background: #f59e0b;
        color: #062a35;
        font-weight: 900;
        font-size: 10pt;
      }
      .cover h1 {
        color: white;
        margin-top: 13mm;
        font-size: 34pt;
        line-height: 1.12;
      }
      .cover p {
        width: 142mm;
        margin-top: 6mm;
        color: #ddf7fa;
        font-size: 14pt;
      }
      .cover-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5mm;
        margin-top: 13mm;
        width: 248mm;
      }
      .cover-grid div, .value-strip div, .cta-box {
        border: 1px solid rgba(14,116,144,.22);
        border-radius: 8px;
        background: rgba(255,255,255,.94);
        padding: 5mm;
      }
      .cover-grid b, .value-strip b { display: block; color: #062a35; font-size: 12pt; }
      .cover-grid span, .value-strip span { display: block; color: #536b7d; font-size: 9.5pt; line-height: 1.35; margin-top: 1.5mm; }
      .two-col {
        display: grid;
        grid-template-columns: 171mm 89mm;
        gap: 8mm;
        align-items: start;
      }
      .grid-layout {
        display: grid;
        grid-template-columns: 178mm 82mm;
        gap: 8mm;
        align-items: start;
      }
      .shot {
        margin: 0;
        border: 1px solid #d6e7ed;
        border-radius: 8px;
        background: white;
        box-shadow: 0 8px 28px rgba(6,42,53,.10);
        overflow: hidden;
      }
      .shot img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: white;
      }
      .main-shot { height: 132mm; }
      .main-shot img { object-fit: contain; }
      .caption {
        padding: 2.4mm 4mm;
        border-top: 1px solid #e1edf2;
        color: #5b7284;
        font-size: 8.8pt;
        font-weight: 700;
        background: #fbfdfe;
      }
      .copy-panel {
        min-height: 132mm;
        border: 1px solid #d6e7ed;
        border-radius: 8px;
        background: white;
        padding: 7mm;
        box-shadow: 0 8px 28px rgba(6,42,53,.08);
      }
      .copy-panel p { font-size: 11.3pt; }
      .shot-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 5mm;
      }
      .shot-grid .shot { height: 58mm; }
      .shot-grid .shot:nth-child(3):last-child { grid-column: span 2; }
      .shot-grid .caption { font-size: 7.8pt; padding: 1.6mm 3mm; }
      .overview-grid {
        display: grid;
        grid-template-columns: 1.18fr 1.18fr .64fr;
        gap: 5mm;
        height: 113mm;
      }
      .overview-grid .shot { height: 113mm; }
      .value-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5mm;
        margin-top: 9mm;
      }
      .final-layout {
        display: grid;
        grid-template-columns: 130mm 132mm;
        gap: 10mm;
        align-items: center;
        height: 170mm;
      }
      .final-layout h1 { font-size: 32pt; }
      .final-layout p { font-size: 13pt; margin-bottom: 4mm; }
      .final-shots {
        display: grid;
        gap: 6mm;
      }
      .final-shots .shot { height: 70mm; }
      .cta-box {
        margin-top: 7mm;
        background: #fff7e6;
        border-color: #f2c66d;
      }
      .cta-box b { color: #062a35; font-size: 12pt; }
      .cta-box span { display: block; color: #22384a; font-size: 11pt; line-height: 1.45; margin-top: 2mm; }
    </style>
    """
    return "<!doctype html><html lang='bn'><head><meta charset='utf-8'>" + css + "</head><body>" + "\n".join(pages) + "</body></html>"


def render_previews(pdf_path: Path) -> None:
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    for old in RENDER_DIR.glob("page-*.png"):
        old.unlink()
    doc = fitz.open(pdf_path)
    for idx, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.15, 1.15), alpha=False)
        pix.save(RENDER_DIR / f"page-{idx:02d}.png")
    doc.close()


def build_pdf() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    html_text = build_html()
    HTML_PATH.write_text(html_text, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1403, "height": 992}, locale="bn-BD")
        page.goto(HTML_PATH.resolve().as_uri(), wait_until="load")
        page.pdf(
            path=str(PDF_PATH),
            width="297mm",
            height="210mm",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
        )
        browser.close()

    render_previews(PDF_PATH)
    shutil.copyfile(PDF_PATH, DOWNLOAD_REPLACE_PATH)
    shutil.copyfile(PDF_PATH, DOWNLOAD_NAMED_PATH)
    print(PDF_PATH)
    print(DOWNLOAD_REPLACE_PATH)
    print(RENDER_DIR)


if __name__ == "__main__":
    build_pdf()
