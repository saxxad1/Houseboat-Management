from __future__ import annotations

import html
import shutil
from pathlib import Path

import fitz
from PIL import Image
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OLD_SHOTS = ROOT / "tmp" / "pdfs" / "floatboat-real-brochure" / "screenshots"
NEW_SHOTS = ROOT / "tmp" / "pdfs" / "floatboat-client-v2" / "screenshots"
WORK = ROOT / "tmp" / "pdfs" / "floatboat-client-v2"
IMG_DIR = WORK / "pdf-images"
RENDER_DIR = WORK / "rendered"
OUT_DIR = ROOT / "output" / "pdf"
HTML_PATH = WORK / "floatboat-client-brochure-v2.html"
PDF_PATH = OUT_DIR / "floatboat-client-brochure-bangla.pdf"
PDF_COMPAT_PATH = OUT_DIR / "floatboat-demo-system-brochure.pdf"
DL_PATH = Path.home() / "Downloads" / "floatboat-demo-system-brochure.pdf"
DL_NAMED_PATH = Path.home() / "Downloads" / "floatboat-client-brochure-bangla.pdf"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def source_for(name: str) -> Path:
    for base in (NEW_SHOTS, OLD_SHOTS):
        path = base / f"{name}.png"
        if path.exists():
            return path
    raise FileNotFoundError(name)


def image_uri(name: str, max_width: int = 1900) -> str:
    src = source_for(name)
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


def bullets(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{esc(item)}</li>" for item in items) + "</ul>"


def shot(name: str, caption: str = "", klass: str = "") -> str:
    cap = f"<figcaption>{esc(caption)}</figcaption>" if caption else ""
    return f"<figure class='shot {klass}'><img src='{image_uri(name)}' alt='{esc(caption or name)}'>{cap}</figure>"


def page(num: int, body: str, klass: str = "") -> str:
    return f"""
    <section class="page {klass}">
      {body}
      <footer><span>FloatBoat স্মার্ট হাউসবোট সিস্টেম</span><span>পৃষ্ঠা {num:02d}</span></footer>
    </section>
    """


def head(tag: str, title: str, subtitle: str) -> str:
    return f"""
    <div class="head">
      <span class="tag">{esc(tag)}</span>
      <h1>{esc(title)}</h1>
      <p>{esc(subtitle)}</p>
    </div>
    """


def note(title: str, text: str, items: list[str]) -> str:
    return f"""
    <aside class="note">
      <h2>{esc(title)}</h2>
      <p>{esc(text)}</p>
      {bullets(items)}
    </aside>
    """


def two_col(num: int, tag: str, title: str, subtitle: str, img: str, caption: str, note_title: str, note_text: str, items: list[str]) -> str:
    body = head(tag, title, subtitle) + f"""
    <div class="two">
      {shot(img, caption, "large")}
      {note(note_title, note_text, items)}
    </div>
    """
    return page(num, body)


def grid(num: int, tag: str, title: str, subtitle: str, imgs: list[tuple[str, str]], note_title: str, note_text: str, items: list[str], klass: str = "") -> str:
    img_html = "".join(shot(name, caption, "tile") for name, caption in imgs)
    body = head(tag, title, subtitle) + f"""
    <div class="grid {klass}">
      <div class="tiles">{img_html}</div>
      {note(note_title, note_text, items)}
    </div>
    """
    return page(num, body)


def cover(num: int) -> str:
    logo = (ROOT / "public" / "logo-floatboat.svg").resolve().as_uri()
    body = f"""
    <div class="cover-graphic">
      <div class="waves"></div>
      <img class="cover-logo" src="{logo}" alt="FloatBoat logo">
      <div class="cover-copy">
        <span class="cover-pill">আপনার হাউসবোটের জন্য স্মার্ট ডিজিটাল সলিউশন</span>
        <h1>ওয়েবসাইট, বুকিং ও অ্যাডমিন ম্যানেজমেন্ট - সব এক সিস্টেমে</h1>
        <p>গেস্ট যেন সহজে ট্রিপের তথ্য দেখে, বুকিং রিকোয়েস্ট পাঠায়, আর আপনি যেন একই জায়গা থেকে বুকিং, কনটেন্ট, সিজন, পেমেন্ট ও রিপোর্ট ম্যানেজ করতে পারেন।</p>
      </div>
      <div class="flow">
        <div><b>গেস্ট ওয়েবসাইট</b><span>কেবিন, খাবার, গ্যালারি, রিভিউ</span></div>
        <div><b>বুকিং ফানেল</b><span>তারিখ, রুম, পেমেন্ট তথ্য</span></div>
        <div><b>অ্যাডমিন প্যানেল</b><span>বুকিং, রিপোর্ট, সিজন সুইচ</span></div>
      </div>
    </div>
    <footer class="light"><span>FloatBoat স্মার্ট হাউসবোট সিস্টেম</span><span>পৃষ্ঠা {num:02d}</span></footer>
    """
    return f"<section class='page cover'>{body}</section>"


def build_html() -> str:
    pages: list[str] = []
    n = 1
    pages.append(cover(n)); n += 1

    pages.append(page(n, head(
        "সিস্টেম ওভারভিউ",
        "আপনার হাউসবোটের জন্য একটি সম্পূর্ণ অনলাইন বুকিং ও ম্যানেজমেন্ট প্ল্যাটফর্ম",
        "একটি লিংক থেকেই গেস্ট আপনার বোট সম্পর্কে জানবে, ভ্রমণ পরিকল্পনা দেখবে, বুকিং রিকোয়েস্ট পাঠাবে এবং আপনার টিম অ্যাডমিন প্যানেল থেকে সবকিছু ম্যানেজ করবে।",
    ) + f"""
    <div class="overview">
      {shot('public-home-live', 'গেস্টের জন্য ওয়েবসাইট')}
      {shot('admin-dashboard', 'মালিকের জন্য অ্যাডমিন ড্যাশবোর্ড')}
      {shot('public-mobile-home', 'মোবাইল ভিউ')}
    </div>
    <div class="benefits">
      <div><b>প্রফেশনাল ব্র্যান্ডিং</b><span>আপনার বোটের লোগো, ছবি, যোগাযোগ, প্যাকেজ এবং গল্প একসাথে সুন্দরভাবে দেখা যাবে।</span></div>
      <div><b>সহজ বুকিং ফ্লো</b><span>গেস্ট তারিখ, রুম, গেস্ট সংখ্যা এবং পেমেন্ট তথ্য দিয়ে রিকোয়েস্ট পাঠাবে।</span></div>
      <div><b>এক জায়গায় নিয়ন্ত্রণ</b><span>বুকিং, রুম, গ্যালারি, রিভিউ, আয়-ব্যয়, রিপোর্ট এবং সিজন মোড অ্যাডমিন থেকে ম্যানেজ হবে।</span></div>
    </div>
    """)); n += 1

    pages.append(two_col(n, "ফ্রন্টএন্ড ওয়েবসাইট", "প্রথম স্ক্রিনেই প্রিমিয়াম ইমপ্রেশন", "ওয়েবসাইট খুললেই গেস্ট আপনার বোটের ব্র্যান্ড, লোকেশন, প্যাকেজ ভ্যালু এবং বুকিং অ্যাকশন দেখতে পাবে।", "public-home-live", "লাইভ হোমপেজ হিরো সেকশন", "আপনার গেস্ট যা দেখবে", "হোমপেজের কাজ হলো প্রথম ১০ সেকেন্ডেই বিশ্বাস তৈরি করা এবং গেস্টকে বুকিং যাত্রায় নিয়ে যাওয়া।", [
        "লোগো, নেভিগেশন, ফোন নম্বর এবং বুক নাও অ্যাকশন প্রথম স্ক্রিনেই থাকে।",
        "মোট রুম, ধারণক্ষমতা, সময়কাল এবং লোকেশন দ্রুত সিদ্ধান্ত নিতে সাহায্য করে।",
        "হিরো সেকশন থেকে কেবিন, ভ্রমণ পরিকল্পনা, খাবারের মেনু, গ্যালারি এবং বুকিং ফর্মে যাওয়া যায়।",
    ])); n += 1

    pages.append(grid(n, "ফ্রন্টএন্ড ওয়েবসাইট", "পরিচিতি, কেবিন ও বুকিং রিকোয়েস্ট", "আপনার বোটের গল্প, রুমের বিস্তারিত, মূল্য এবং বুকিং রিকোয়েস্ট ফ্লো ওয়েবসাইটেই পরিষ্কারভাবে থাকবে।", [
        ("public-about", "পরিচিতি সেকশন"),
        ("public-cabins", "কেবিন / রুম সেকশন"),
        ("public-booking-modal", "বুকিং রিকোয়েস্ট ফর্ম"),
    ], "গেস্টের জন্য সুবিধা", "গেস্টকে বারবার হোয়াটসঅ্যাপে ছবি, মূল্য বা রুমের বিস্তারিত চাইতে হবে না। ওয়েবসাইটেই তারা তথ্য দেখে বুকিং রিকোয়েস্ট দিতে পারবে।", [
        "প্রতিটি কেবিনের ছবি, ধারণক্ষমতা, এসি, প্রাইভেট বাথ ও খাবার অন্তর্ভুক্ত সুবিধা দেখানো যায়।",
        "পুরো বোট বুকিং এবং কেবিনভিত্তিক বুকিং দুটোই সাপোর্ট করা যায়।",
        "বুকিং ফর্মে নাম, ফোন, তারিখ, রুম, গেস্ট সংখ্যা এবং পেমেন্ট নোট নেওয়া যায়।",
    ], "three")); n += 1

    pages.append(grid(n, "বুকিং ও ক্যালেন্ডার", "তারিখের খালি/বুকড অবস্থা এবং বুকিং কনফার্মেশন", "গেস্ট আগে কোন তারিখ খালি আছে দেখে রিকোয়েস্ট পাঠাবে, আর অ্যাডমিন প্যানেল থেকে আপনি বুকিং স্ট্যাটাস ম্যানেজ করবেন।", [
        ("public-availability", "গেস্টের বুকিং ক্যালেন্ডার"),
        ("admin-availability", "অ্যাডমিন তারিখ ক্যালেন্ডার"),
    ], "কেন দরকার", "তারিখের অবস্থা পরিষ্কার থাকলে ডাবল বুকিং কমে এবং গেস্ট আগে থেকেই বুঝতে পারে কোন তারিখ নিয়ে কথা বলা যাবে।", [
        "ক্যালেন্ডার থেকে খালি এবং বুকড তারিখ দেখা যায়।",
        "অ্যাডমিন প্যানেল থেকে তারিখের স্ট্যাটাস, বুকিং ব্লক এবং শিডিউল ম্যানেজ করা যায়।",
        "বুকিং রিকোয়েস্ট কনফার্ম করার আগে মালিক/টিম সব তথ্য রিভিউ করতে পারে।",
    ])); n += 1

    pages.append(grid(n, "ট্রিপ ইনফরমেশন", "ভ্রমণ পরিকল্পনা ও খাবারের মেনু", "গেস্ট বুকিং করার আগে রুট, সময়সূচি, খাবারের আয়োজন এবং অন্তর্ভুক্ত সুবিধাগুলো জানতে চায়। এই দুই সেকশন সেই প্রশ্নের উত্তর দেয়।", [
        ("public-itinerary-clean", "ভ্রমণ পরিকল্পনার পরিষ্কার স্ক্রিনশট"),
        ("public-food-menu-clean", "খাবারের মেনুর পরিষ্কার স্ক্রিনশট"),
    ], "আপনার গেস্ট যা বুঝবে", "ভ্রমণ পরিকল্পনা ও খাবারের মেনু পরিষ্কার থাকলে গেস্টের প্রত্যাশা ঠিক থাকে এবং প্যাকেজ ভ্যালু প্রিমিয়াম মনে হয়।", [
        "দিনভিত্তিক রুট, স্টপ, সময় এবং কার্যক্রম দেখানো যায়।",
        "সকালের নাস্তা, দুপুরের খাবার, রাতের খাবার, স্ন্যাকস এবং কাস্টম খাবারের আয়োজন দেখানো যায়।",
        "কর্পোরেট গ্রুপ বা ফ্যামিলি প্যাকেজ বিক্রি করা সহজ হয়।",
    ])); n += 1

    pages.append(grid(n, "স্পট ও সুবিধা", "ভ্রমণ স্পট এবং বোটের সুবিধা", "ট্রিপ কোথায় যাবে এবং বোটে কী কী সুবিধা থাকবে, এই দুটি বিষয় গেস্টের সিদ্ধান্তের জন্য খুব গুরুত্বপূর্ণ।", [
        ("public-destinations", "ভ্রমণ স্পট সেকশন"),
        ("public-facilities", "সুবিধাসমূহ সেকশন"),
    ], "আপনার বোটের ভ্যালু আরও পরিষ্কার হবে", "ডেস্টিনেশন কার্ড ও সুবিধার তালিকা আপনার ট্রিপকে শুধু বোট রাইড নয়, একটি সম্পূর্ণ ভ্রমণ অভিজ্ঞতা হিসেবে তুলে ধরে।", [
        "টাঙ্গুয়ার হাওর, নিলাদ্রি, বারিক্কা টিলা, যাদুকাটা - রুটের স্পটগুলো সুন্দরভাবে দেখানো যায়।",
        "নিরাপত্তা, রুফটপ, ডাইনিং, ওয়াশরুম, ক্রু সাপোর্ট ইত্যাদি দৃশ্যমান থাকে।",
        "গেস্ট আগে থেকেই আরাম এবং নিরাপত্তা নিয়ে পরিষ্কার ধারণা পায়।",
    ])); n += 1

    pages.append(grid(n, "মিডিয়া শোকেস", "ফটো গ্যালারি ও ভিডিও গ্যালারি", "আপনার হাউসবোটের সুন্দর মুহূর্ত, ইন্টেরিয়র, রুফটপ, গেস্ট অভিজ্ঞতা এবং ফেসবুক ভিডিও একই ওয়েবসাইটে শোকেস করা যাবে।", [
        ("public-gallery-clean", "ফটো গ্যালারি"),
        ("public-videos-clean", "ভিডিও গ্যালারি"),
    ], "বিশেষ সুবিধা", "ফটো গ্যালারি এবং ভিডিও গ্যালারি একসাথে থাকলে গেস্ট শুধু লেখা নয়, বাস্তব অভিজ্ঞতা দেখতে পায়।", [
        "ফটো গ্যালারি দিয়ে বোটের ইন্টেরিয়র, কেবিন, ডেক, খাবার এবং ভ্রমণের মুহূর্ত দেখানো যায়।",
        "ফেসবুক পেজ/রিল/ভিডিও লিংক অ্যাডমিন গ্যালারিতে দিলে ওয়েবসাইটে ভিডিও হিসেবে দেখা যায়।",
        "সোশ্যাল মিডিয়ার কনটেন্ট ওয়েবসাইটের ভেতরেই প্রিমিয়ামভাবে দেখা যাবে।",
    ])); n += 1

    pages.append(two_col(n, "সোশ্যাল প্রুফ", "গেস্ট রিভিউ আলাদা সেকশন হিসেবে থাকবে", "রিভিউ সেকশন নতুন গেস্টের আস্থা বাড়ায়। তারা আগের গেস্টের অভিজ্ঞতা দেখে বুকিং সিদ্ধান্ত নিতে পারে।", "public-reviews-clean", "রিভিউ সেকশন", "রিভিউ কেন আলাদা", "ফটো/ভিডিও গ্যালারি অভিজ্ঞতা দেখায়, আর রিভিউ গেস্ট সন্তুষ্টির প্রমাণ দেয়। তাই রিভিউ আলাদা সেকশন হিসেবে রাখা হয়েছে।", [
        "রেটিং, রিভিউ এবং গেস্টের নাম/লোকেশন সুন্দরভাবে দেখানো যায়।",
        "অ্যাডমিন প্যানেল থেকে রিভিউ যোগ, সম্পাদনা এবং প্রকাশ করা যায়।",
        "ভালো রিভিউ নতুন ইনকোয়ারিকে বুকিংয়ে রূপান্তর করতে সাহায্য করে।",
    ])); n += 1

    pages.append(grid(n, "সাপোর্ট কনটেন্ট", "প্রশ্নোত্তর, গেস্ট গাইডলাইন, যোগাযোগ ও আমার বুকিং", "গেস্ট যেন বারবার একই প্রশ্ন না করে, সে জন্য প্রশ্নোত্তর, ট্রিপ নিয়ম, যোগাযোগ এবং বুকিং স্ট্যাটাস চেক একসাথে থাকবে।", [
        ("public-faq", "প্রশ্নোত্তর সেকশন"),
        ("public-guest-guidelines", "গেস্ট গাইডলাইন"),
        ("public-contact", "যোগাযোগ সেকশন"),
        ("public-my-bookings", "আমার বুকিং পেজ"),
    ], "গেস্ট সাপোর্ট সহজ হবে", "এই সেকশনগুলো সাপোর্টের চাপ কমায় এবং গেস্টকে নিজে নিজে তথ্য পাওয়ার সুবিধা দেয়।", [
        "প্রশ্নোত্তরে সাধারণ বুকিং, পেমেন্ট, নিরাপত্তা এবং বাতিলকরণ প্রশ্নের উত্তর থাকবে।",
        "গাইডলাইন ট্রিপ নিয়ম ও নিরাপত্তা নির্দেশনা আগে থেকেই জানাবে।",
        "আমার বুকিং পেজ গেস্টকে রিকোয়েস্ট স্ট্যাটাস চেক করতে সাহায্য করবে।",
    ], "four")); n += 1

    pages.append(two_col(n, "মোবাইল অভিজ্ঞতা", "মোবাইল থেকেই বুকিংয়ের জন্য প্রস্তুত", "বাংলাদেশে অধিকাংশ গেস্ট মোবাইল থেকে ওয়েবসাইট খোলে। তাই মোবাইল ভিউ পরিষ্কার, পড়ার মতো এবং বুকিং-কেন্দ্রিক রাখা হয়েছে।", "public-mobile-home", "মোবাইল হোমপেজ ভিউ", "মোবাইলে যা থাকবে", "ফেসবুক বা হোয়াটসঅ্যাপ থেকে লিংক পাঠালে গেস্ট মোবাইল স্ক্রিন থেকেই ট্রিপ তথ্য দেখবে এবং দ্রুত যোগাযোগ বা বুকিং অ্যাকশন নিতে পারবে।", [
        "হিরো, স্ট্যাটস, বুকিং বাটন এবং হোয়াটসঅ্যাপ অ্যাকশন মোবাইলবান্ধব।",
        "নেভিগেশন কমপ্যাক্ট থাকে, কনটেন্ট স্ক্রল করে সহজে দেখা যায়।",
        "ফ্লোটিং হোয়াটসঅ্যাপ গেস্ট ইনকোয়ারি দ্রুত ধরে রাখতে সাহায্য করে।",
    ])); n += 1

    pages.append(two_col(n, "অ্যাডমিন প্যানেল", "ড্যাশবোর্ড থেকে ব্যবসার সারাংশ", "আপনার টিম এক জায়গা থেকে ট্রিপ, গেস্ট, আয়, খরচ, লাভ এবং সাম্প্রতিক কার্যক্রম দেখতে পারবে।", "admin-dashboard", "অ্যাডমিন ড্যাশবোর্ড", "মালিকের কন্ট্রোল প্যানেল", "ড্যাশবোর্ড শুধু ডেটা দেখানোর জন্য নয়; এটি দৈনন্দিন অপারেশন বুঝে দ্রুত সিদ্ধান্ত নিতে সাহায্য করে।", [
        "মোট ট্রিপ, গেস্ট, আয়, খরচ এবং নিট লাভের সারাংশ দেখা যায়।",
        "সাম্প্রতিক বুকিং এবং সাম্প্রতিক খরচ দ্রুত রিভিউ করা যায়।",
        "তারিখ ফিল্টার দিয়ে নির্দিষ্ট সময়ের পারফরম্যান্স দেখা যায়।",
    ])); n += 1

    pages.append(grid(n, "অ্যাডমিন অপারেশন", "বুকিং, ট্রিপ ও রুম ম্যানেজমেন্ট", "বুকিং রিকোয়েস্ট থেকে রুম সেটআপ পর্যন্ত দৈনন্দিন অপারেশন অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রণ করা যাবে।", [
        ("admin-bookings", "বুকিং ম্যানেজমেন্ট"),
        ("admin-trips", "ট্রিপ ম্যানেজমেন্ট"),
        ("admin-rooms", "রুম / কেবিন ম্যানেজমেন্ট"),
    ], "আপনার টিম যা ম্যানেজ করবে", "ম্যানুয়াল নোটবুক বা ছড়িয়ে থাকা চ্যাটের বদলে বুকিং এবং রুম অপারেশন গুছানো থাকবে।", [
        "বুকিং স্ট্যাটাস, পেমেন্ট স্ট্যাটাস, গেস্ট সংখ্যা এবং টাকার পরিমাণ ট্র্যাক করা যায়।",
        "ট্রিপ স্লট, ম্যানুয়াল বুকিং, ট্রিপভিত্তিক আয়-খরচ নোট রাখা যায়।",
        "রুম/কেবিন ছবি, মূল্য, ধারণক্ষমতা, এসি, ওয়াশরুম এবং স্ট্যাটাস আপডেট করা যায়।",
    ], "three")); n += 1

    pages.append(grid(n, "সবচেয়ে বড় সেলিং পয়েন্ট", "একই ওয়েবসাইটে হাওর সিজন + পদ্মা সিজন", "হাওর সিজন শেষ হলে নতুন ওয়েবসাইট বানানোর দরকার নেই। অ্যাডমিন প্যানেল থেকে পদ্মা সিজন চালু করলেই একই ওয়েবসাইট পদ্মা মার্কেটিংয়ের জন্য প্রস্তুত হয়ে যাবে।", [
        ("admin-season-settings", "সিজন মোড সুইচ"),
        ("public-padma-home", "পদ্মা মোডের ওয়েবসাইট প্রিভিউ"),
        ("admin-padma-trip", "পদ্মা ট্রিপ অ্যাডমিন সেটিংস"),
    ], "সিজন সুইচের কাজ", "আপনার হাউসবোট যখন টাঙ্গুয়ার হাওর থেকে পদ্মা ডে-লং ক্রুজ বা ইভেন্ট অফারে যাবে, তখন একই সিস্টেম নতুন অফার অনুযায়ী কনটেন্ট দেখাবে।", [
        "অ্যাডমিন থেকে হাওর সিজন বা পদ্মা সিজন সক্রিয় করা যায়।",
        "পদ্মা সক্রিয় করলে হোমপেজ লেখা, রুম/ইভেন্ট স্পেস, প্যাকেজ, খাবার, প্রশ্নোত্তর এবং যোগাযোগের কনটেন্ট পদ্মা অফার অনুযায়ী দেখা যাবে।",
        "পদ্মা ডে-লং মূল্য এবং গুরুত্বপূর্ণ ট্রিপ তথ্য আলাদাভাবে অ্যাডমিন প্যানেল থেকে ম্যানেজ করা যায়।",
        "একই ডোমেইন, একই অ্যাডমিন, একই ব্র্যান্ড - শুধু সিজন বদলালেই নতুন মার্কেটিং-রেডি ওয়েবসাইট।",
    ], "three focus")); n += 1

    pages.append(grid(n, "হিসাব ও রিপোর্ট", "আয়, খরচ, ডিসকাউন্ট ও রিপোর্ট", "বুকিং ছাড়াও ব্যবসার আয়-ব্যয়, ডিসকাউন্ট ক্যাম্পেইন এবং রিপোর্ট এক জায়গায় ট্র্যাক করা যাবে।", [
        ("admin-income", "আয় ট্র্যাকিং"),
        ("admin-expenses", "খরচ ট্র্যাকিং"),
        ("admin-reports", "রিপোর্ট"),
        ("admin-discount", "ডিসকাউন্ট সেটিংস"),
    ], "ব্যবসার হিসাব পরিষ্কার", "সিজন শেষে লাভ-ক্ষতি বুঝতে গেলে গুছানো আয়-খরচের ডেটা খুব গুরুত্বপূর্ণ।", [
        "বুকিং আয় ছাড়াও অতিরিক্ত আয় ক্যাটাগরিভিত্তিক রাখা যায়।",
        "খাবার, জ্বালানি, স্টাফ, মেইনটেন্যান্স এবং মার্কেটিং খরচ ট্র্যাক করা যায়।",
        "রিপোর্ট থেকে বকেয়া, আয়, খরচ এবং লাভ বোঝা যায়।",
        "ডিসকাউন্ট সেটিংস দিয়ে ক্যাম্পেইন এবং বিশেষ তারিখ নিয়ন্ত্রণ করা যায়।",
    ], "four")); n += 1

    pages.append(grid(n, "কনটেন্ট নিয়ন্ত্রণ", "গ্যালারি, রিভিউ, কাস্টমার ও সেটিংস", "আপনি বা আপনার টিম ওয়েবসাইটের প্রয়োজনীয় কনটেন্ট, ছবি, রিভিউ, কাস্টমার রেকর্ড এবং ব্র্যান্ড সেটিংস আপডেট করতে পারবেন।", [
        ("admin-gallery", "গ্যালারি ম্যানেজমেন্ট"),
        ("admin-reviews", "রিভিউ ম্যানেজমেন্ট"),
        ("admin-customers", "কাস্টমার রেকর্ড"),
        ("admin-settings", "ব্র্যান্ড ও যোগাযোগ সেটিংস"),
    ], "নিজের ব্র্যান্ড নিজেই আপডেট", "ওয়েবসাইট আপডেট করতে বারবার ডেভেলপারের উপর নির্ভর করতে হবে না; অ্যাডমিন প্যানেল থেকেই দরকারি কনটেন্ট নিয়ন্ত্রণ করা যাবে।", [
        "গ্যালারিতে ছবি বা ভিডিও লিংক যোগ করা যায়।",
        "রিভিউ যোগ, সম্পাদনা ও প্রকাশ করে সোশ্যাল প্রুফ নিয়ন্ত্রণ করা যায়।",
        "কাস্টমার রেকর্ড ভবিষ্যৎ ফলো-আপ এবং পুনরায় বুকিংয়ের জন্য সহায়ক।",
        "সেটিংস থেকে ব্র্যান্ড, যোগাযোগ, পেমেন্ট এবং হাউসবোটের বিস্তারিত আপডেট করা যায়।",
    ], "four")); n += 1

    pages.append(page(n, head(
        "আপনার হাউসবোটের জন্য যা তৈরি হবে",
        "একটি আধুনিক, বুকিং-কেন্দ্রিক ওয়েবসাইট এবং সম্পূর্ণ অ্যাডমিন সিস্টেম",
        "এই সিস্টেম আপনার গেস্ট অভিজ্ঞতা, বুকিং ম্যানেজমেন্ট, মিডিয়া শোকেস, সিজন মার্কেটিং এবং ব্যবসার রিপোর্টিং - সবকিছুকে এক জায়গায় নিয়ে আসবে।",
    ) + """
    <div class="final-cards">
      <div><b>গেস্টের জন্য</b><span>সুন্দর ওয়েবসাইট, ট্রিপ তথ্য, রুমের বিস্তারিত, খাবারের মেনু, গ্যালারি, ভিডিও, রিভিউ, প্রশ্নোত্তর, যোগাযোগ এবং বুকিং রিকোয়েস্ট।</span></div>
      <div><b>মালিক/টিমের জন্য</b><span>বুকিং, তারিখের অবস্থা, রুম, ট্রিপ, আয়, খরচ, রিপোর্ট, গ্যালারি, রিভিউ, কাস্টমার এবং সেটিংস ম্যানেজমেন্ট।</span></div>
      <div><b>সিজন মার্কেটিংয়ের জন্য</b><span>হাওর সিজন থেকে পদ্মা সিজনে সুইচ করে একই ওয়েবসাইটকে নতুন অফারের জন্য প্রস্তুত করা যাবে।</span></div>
    </div>
    <div class="closing">
      <h2>আপনার হাউসবোটকে শুধু ফেসবুক পেজ নয়, একটি সম্পূর্ণ ডিজিটাল বুকিং সিস্টেমে আনুন।</h2>
      <p>প্রফেশনাল প্রেজেন্টেশন, গুছানো বুকিং ফ্লো এবং অ্যাডমিন কন্ট্রোল একসাথে থাকলে গেস্টের বিশ্বাস বাড়ে, ইনকোয়ারি কম ছড়িয়ে থাকে, আর ব্যবসা ম্যানেজ করা সহজ হয়।</p>
    </div>
    """)); n += 1

    css = """
    <style>
      @page { size: A4 landscape; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #eef6f8;
        color: #092f3b;
        font-family: "Bangla Sangam MN", "Bangla MN", "Noto Sans Bengali", Arial, sans-serif;
      }
      .page {
        position: relative;
        width: 297mm;
        height: 210mm;
        padding: 11mm 12mm 13mm;
        background: linear-gradient(135deg, #f8fcfd 0%, #eef8fb 100%);
        overflow: hidden;
        page-break-after: always;
      }
      footer {
        position: absolute;
        left: 12mm;
        right: 12mm;
        bottom: 5mm;
        border-top: 1px solid #d5e7ed;
        padding-top: 2mm;
        display: flex;
        justify-content: space-between;
        color: #658091;
        font-size: 8.5pt;
        font-weight: 800;
      }
      .light { color: rgba(255,255,255,.9); border-color: rgba(255,255,255,.25); }
      .cover {
        padding: 0;
        background: radial-gradient(circle at 84% 10%, rgba(34,211,238,.30), transparent 34%),
          linear-gradient(135deg, #062a35 0%, #0b5262 58%, #0e7490 100%);
      }
      .cover-graphic { position: absolute; inset: 0; padding: 16mm; }
      .cover-logo { width: 78mm; height: auto; filter: drop-shadow(0 14px 24px rgba(0,0,0,.18)); background: rgba(255,255,255,.95); border-radius: 10px; padding: 4mm; }
      .cover-copy { width: 176mm; margin-top: 13mm; color: white; }
      .cover-pill, .tag {
        display: inline-flex;
        align-items: center;
        min-height: 7mm;
        padding: 1.4mm 4.2mm;
        border-radius: 99px;
        background: #f59e0b;
        color: #062a35;
        font-weight: 900;
        font-size: 10pt;
      }
      .cover h1 { margin: 7mm 0 5mm; font-size: 36pt; line-height: 1.12; color: white; }
      .cover p { width: 158mm; color: #ddfbff; font-size: 14pt; line-height: 1.55; margin: 0; }
      .flow {
        position: absolute;
        left: 16mm;
        right: 16mm;
        bottom: 24mm;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6mm;
      }
      .flow div, .benefits div, .final-cards div {
        border: 1px solid rgba(14,116,144,.2);
        border-radius: 10px;
        background: rgba(255,255,255,.94);
        padding: 5mm;
        box-shadow: 0 10px 30px rgba(6,42,53,.12);
      }
      .flow b, .benefits b, .final-cards b { display: block; color: #062a35; font-size: 12.5pt; }
      .flow span, .benefits span, .final-cards span { display: block; color: #536b7d; margin-top: 1.5mm; font-size: 9.8pt; line-height: 1.4; }
      .head { margin-bottom: 6mm; }
      .tag { background: #d7f7fb; color: #087185; font-size: 9pt; min-height: 6.5mm; }
      h1 { margin: 3.5mm 0 2mm; font-size: 25pt; line-height: 1.15; color: #062a35; max-width: 255mm; }
      .head p { margin: 0; color: #516b7e; font-size: 11.7pt; line-height: 1.45; max-width: 255mm; }
      h2 { margin: 0 0 3mm; color: #062a35; font-size: 17pt; line-height: 1.2; }
      p { margin: 0; color: #4f687a; font-size: 11pt; line-height: 1.45; }
      .two, .grid {
        display: grid;
        grid-template-columns: 174mm 84mm;
        gap: 7mm;
        align-items: start;
      }
      .shot {
        margin: 0;
        overflow: hidden;
        background: white;
        border: 1px solid #d5e7ed;
        border-radius: 9px;
        box-shadow: 0 12px 34px rgba(6,42,53,.10);
      }
      .shot img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: white;
      }
      .shot figcaption {
        border-top: 1px solid #e3eef2;
        background: #fbfdfe;
        color: #62798a;
        padding: 2mm 3.2mm;
        font-size: 8.2pt;
        font-weight: 800;
      }
      .large { height: 130mm; }
      .note {
        min-height: 130mm;
        background: white;
        border: 1px solid #d5e7ed;
        border-radius: 9px;
        padding: 6mm;
        box-shadow: 0 12px 34px rgba(6,42,53,.08);
      }
      ul { list-style: none; margin: 5mm 0 0; padding: 0; }
      li {
        position: relative;
        margin-bottom: 3.2mm;
        padding-left: 7mm;
        color: #253d4e;
        font-size: 10.6pt;
        line-height: 1.42;
      }
      li::before {
        content: "";
        position: absolute;
        left: 0;
        top: 2.2mm;
        width: 3mm;
        height: 3mm;
        border-radius: 50%;
        background: #0e7490;
      }
      .tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; }
      .tiles .tile { height: 82mm; }
      .three .tiles { grid-template-columns: repeat(2, 1fr); }
      .three .tiles .tile { height: 42mm; }
      .three .tiles .tile:first-child { grid-row: span 2; height: 89mm; }
      .four .tiles { grid-template-columns: repeat(2, 1fr); }
      .four .tiles .tile { height: 42mm; }
      .focus .tiles .tile { height: 45mm; }
      .focus .tiles .tile:first-child { height: 95mm; }
      .overview {
        display: grid;
        grid-template-columns: 1.1fr 1.1fr .68fr;
        gap: 5mm;
        height: 111mm;
      }
      .overview .shot { height: 111mm; }
      .benefits {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5mm;
        margin-top: 7mm;
      }
      .final-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6mm;
        margin-top: 12mm;
      }
      .closing {
        margin-top: 13mm;
        border-radius: 14px;
        background: #062a35;
        color: white;
        padding: 9mm;
      }
      .closing h2 { color: white; font-size: 23pt; margin-bottom: 4mm; }
      .closing p { color: #ddfbff; font-size: 12.5pt; max-width: 240mm; }
    </style>
    """
    return "<!doctype html><html lang='bn'><head><meta charset='utf-8'>" + css + "</head><body>" + "\n".join(pages) + "</body></html>"


def render_previews(path: Path) -> None:
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    for old in RENDER_DIR.glob("page-*.png"):
        old.unlink()
    doc = fitz.open(path)
    for i, pdf_page in enumerate(doc, 1):
        pix = pdf_page.get_pixmap(matrix=fitz.Matrix(1.12, 1.12), alpha=False)
        pix.save(RENDER_DIR / f"page-{i:02d}.png")
    doc.close()


def build() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    HTML_PATH.write_text(build_html(), encoding="utf-8")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1403, "height": 992}, locale="bn-BD")
        page.goto(HTML_PATH.resolve().as_uri(), wait_until="load")
        page.pdf(
            path=str(PDF_PATH),
            width="297mm",
            height="210mm",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        browser.close()
    shutil.copyfile(PDF_PATH, PDF_COMPAT_PATH)
    shutil.copyfile(PDF_PATH, DL_PATH)
    shutil.copyfile(PDF_PATH, DL_NAMED_PATH)
    render_previews(PDF_PATH)
    print(PDF_PATH)
    print(DL_PATH)
    print(RENDER_DIR)


if __name__ == "__main__":
    build()
