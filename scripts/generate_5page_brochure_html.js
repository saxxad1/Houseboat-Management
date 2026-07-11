const fs = require('fs');

function getBase64Image(filePath) {
    if (!fs.existsSync(filePath)) return '';
    const file = fs.readFileSync(filePath);
    return `data:image/png;base64,${file.toString('base64')}`;
}

const images = {
    hero: '/Users/pc/.gemini/antigravity/brain/8fd1b653-0459-46e4-aa81-62dbcbeb47b0/media__1783719563737.png',
    about: '/Users/pc/.gemini/antigravity/brain/8fd1b653-0459-46e4-aa81-62dbcbeb47b0/media__1783719595890.png',
    cabins: '/Users/pc/.gemini/antigravity/brain/8fd1b653-0459-46e4-aa81-62dbcbeb47b0/media__1783719630212.png',
    bookingForm: '/Users/pc/.gemini/antigravity/brain/8fd1b653-0459-46e4-aa81-62dbcbeb47b0/media__1783719644230.png',
    calendar: '/Users/pc/.gemini/antigravity/brain/8fd1b653-0459-46e4-aa81-62dbcbeb47b0/media__1783715481491.png'
};

const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Premium Houseboat Solution Features</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');

        body {
            font-family: 'Inter', 'Noto Sans Bengali', sans-serif;
            line-height: 1.7;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }

        .page {
            width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 50px 60px;
            box-sizing: border-box;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
        }

        h1 {
            font-size: 32px;
            color: #0f172a;
            margin: 0 0 10px 0;
            font-weight: 800;
        }
        
        .subtitle {
            font-size: 18px;
            color: #0284c7;
            font-weight: 600;
        }

        .screenshot-container {
            margin: 20px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px -5px rgba(0,0,0,0.15);
            border: 1px solid #cbd5e1;
        }

        .screenshot-container img {
            width: 100%;
            display: block;
        }

        .content-box {
            background: #f1f5f9;
            border-left: 5px solid #0ea5e9;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-top: 25px;
        }

        h3 {
            color: #0369a1;
            font-size: 20px;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .feature-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .feature-item h4 {
            margin: 0 0 5px 0;
            color: #334155;
            font-size: 16px;
        }

        .feature-item p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>

    <!-- Page 1: Hero Section -->
    <div class="page">
        <div class="header">
            <h1>১. আকর্ষণীয় ফার্স্ট ইম্প্রেশন (Hero Section)</h1>
            <div class="subtitle">গেস্টদের মনোযোগ আকর্ষণ এবং ব্র্যান্ডিং</div>
        </div>
        
        <div class="screenshot-container">
            <img src="${getBase64Image(images.hero)}" alt="Hero Section">
        </div>

        <div class="content-box">
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>এই সেকশনে কী কী আছে?</h4>
                    <p>একটি প্রিমিয়াম ব্যাকগ্রাউন্ড ছবি, হাউসবোটের মূল স্লোগান, সরাসরি 'Book Now' বাটন এবং হাউসবোটের ধারণক্ষমতার (রুম, মানুষ, দিন) একটি সুন্দর ওভারভিউ।</p>
                </div>
                <div class="feature-item">
                    <h4>এটি কেন প্রয়োজন?</h4>
                    <p>ওয়েবসাইটে প্রবেশের প্রথম ৩ সেকেন্ডের মধ্যেই গেস্টরা সিদ্ধান্ত নেন তারা সাইটে থাকবেন কি না। একটি প্রফেশনাল হিরো সেকশন হাউসবোটের স্ট্যান্ডার্ড বুঝিয়ে দেয়।</p>
                </div>
                <div class="feature-item">
                    <h4>আপনার বেনিফিট কী?</h4>
                    <p>কাস্টমাররা প্রথমেই আপনার হাউসবোটকে একটি প্রিমিয়াম সার্ভিস হিসেবে মূল্যায়ন করবে। সহজে বুকিং বাটন থাকায় কনভার্শন রেট (বুকিং হওয়ার সম্ভাবনা) বহুগুণ বেড়ে যায়।</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 2: About Section -->
    <div class="page">
        <div class="header">
            <h1>২. সুবিধা ও নিরাপত্তার নিশ্চয়তা (About Features)</h1>
            <div class="subtitle">ট্রাস্ট বিল্ড-আপ এবং সার্ভিসের ক্লিয়ার পিকচার</div>
        </div>
        
        <div class="screenshot-container">
            <img src="${getBase64Image(images.about)}" alt="About Section">
        </div>

        <div class="content-box">
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>এই সেকশনে কী কী আছে?</h4>
                    <p>হাউসবোটের মূল সুবিধাগুলো—যেমন: লাক্সারি এসি কেবিন, প্রিমিয়াম ডাইনিং, সেফটি গিয়ার (লাইফ জ্যাকেট), এবং কাদের জন্য এই বোট উপযুক্ত তার বিস্তারিত বর্ণনা।</p>
                </div>
                <div class="feature-item">
                    <h4>এটি কেন প্রয়োজন?</h4>
                    <p>গেস্টরা ট্যুরে যাওয়ার আগে সবচেয়ে বেশি চিন্তায় থাকে নিরাপত্তা এবং সুযোগ-সুবিধা নিয়ে। এই সেকশনটি তাদের সব কনফিউশন দূর করে দেয়।</p>
                </div>
                <div class="feature-item">
                    <h4>আপনার বেনিফিট কী?</h4>
                    <p>মেসেঞ্জারে গেস্টদের বারবার একই প্রশ্নের উত্তর দিতে হবে না। 'বোটে এসি আছে কি না?', 'নিরাপত্তা কেমন?'—এইসব প্রশ্নের উত্তর ওয়েবসাইট থেকেই তারা পেয়ে যাবে।</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 3: Cabins & Pricing -->
    <div class="page">
        <div class="header">
            <h1>৩. স্বচ্ছ প্যাকেজ ও প্রাইসিং (Luxury Cabins)</h1>
            <div class="subtitle">সহজ নির্বাচন এবং আপসেলিং সুযোগ</div>
        </div>
        
        <div class="screenshot-container">
            <img src="${getBase64Image(images.cabins)}" alt="Cabins Section">
        </div>

        <div class="content-box">
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>এই সেকশনে কী কী আছে?</h4>
                    <p>প্রতিটি কেবিনের আলাদা ছবি, নাম, ধারণক্ষমতা, সুযোগ-সুবিধা (অ্যাটাচড বাথ, এসি/নন-এসি) এবং প্রাইসিং (উইকেন্ড/উইকডে ডিসকাউন্ট) সুন্দর কার্ড আকারে সাজানো আছে।</p>
                </div>
                <div class="feature-item">
                    <h4>এটি কেন প্রয়োজন?</h4>
                    <p>অনেক কাস্টমার প্রাইস জানতে চেয়ে মেসেজ দেয়, কিন্তু রিপ্লাই পেতে দেরি হলে অন্য বোটে চলে যায়। ট্রান্সপারেন্ট প্রাইসিং কাস্টমারদের দ্রুত সিদ্ধান্ত নিতে সাহায্য করে।</p>
                </div>
                <div class="feature-item">
                    <h4>আপনার বেনিফিট কী?</h4>
                    <p>ম্যানুয়াল বারগেনিং (দরদাম) কমে যাবে। গেস্টরা তাদের বাজেট অনুযায়ী নিজেরাই কেবিন পছন্দ করতে পারবে এবং প্রতিটি কেবিনের নিচে থাকা 'Book This Cabin' বাটনে ক্লিক করে সরাসরি বুকিংয়ে চলে যাবে।</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 4: Booking Form -->
    <div class="page">
        <div class="header">
            <h1>৪. স্মার্ট অনলাইন বুকিং সিস্টেম (Booking Request)</h1>
            <div class="subtitle">অটোমেটেড হিসাব এবং ডেটা কালেকশন</div>
        </div>
        
        <div class="screenshot-container">
            <img src="${getBase64Image(images.bookingForm)}" alt="Booking Form">
        </div>

        <div class="content-box">
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>এই সেকশনে কী কী আছে?</h4>
                    <p>একটি ডিজিটাল বুকিং ফর্ম যেখানে গেস্টের নাম, ফোন নাম্বার, চেক-ইন/চেক-আউট ডেট, কেবিন সিলেক্ট করার অপশন এবং স্বয়ংক্রিয়ভাবে মোট খরচ (বিকাশ/নগদ ডিটেইলসসহ) হিসাব হওয়ার ব্যবস্থা আছে।</p>
                </div>
                <div class="feature-item">
                    <h4>এটি কেন প্রয়োজন?</h4>
                    <p>খাতা-কলমে বা মেসেঞ্জারে বুকিং রাখলে ভুল হওয়ার বা ডেটা হারিয়ে যাওয়ার সম্ভাবনা থাকে। এই সিস্টেমটি সম্পূর্ণ প্রসেসটিকে ডিজিটাল এবং ত্রুটিমুক্ত করে।</p>
                </div>
                <div class="feature-item">
                    <h4>আপনার বেনিফিট কী?</h4>
                    <p>গেস্ট ফর্মটি সাবমিট করার সাথে সাথেই আপনি অ্যাডমিন প্যানেলে সব তথ্য পেয়ে যাবেন। পেমেন্ট হিসাব করা নিয়ে আপনাকে কোনো মাথা ঘামাতে হবে না, সিস্টেম নিজেই তা করে দেবে। আপনার প্রফেশনালিজম দেখে গেস্টরা মুগ্ধ হবে।</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 5: Availability Calendar -->
    <div class="page">
        <div class="header">
            <h1>৫. রিয়েল-টাইম অ্যাভেইলেবিলিটি (Booking Calendar)</h1>
            <div class="subtitle">বুকিং কনফ্লিক্ট বা ওভারবুকিং রোধ</div>
        </div>
        
        <div class="screenshot-container">
            <img src="${getBase64Image(images.calendar)}" alt="Booking Calendar">
        </div>

        <div class="content-box">
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>এই সেকশনে কী কী আছে?</h4>
                    <p>একটি রিয়েল-টাইম ক্যালেন্ডার যেখানে সবুজ রং দিয়ে ফাঁকা ডেট এবং অন্য রং দিয়ে বুকড ডেটগুলো চিহ্নিত থাকে।</p>
                </div>
                <div class="feature-item">
                    <h4>এটি কেন প্রয়োজন?</h4>
                    <p>সবচেয়ে সাধারণ প্রশ্ন হলো, "ভাই, অমুক তারিখে কি বোট ফাঁকা আছে?"। এই ক্যালেন্ডারটি সেই প্রশ্নের একটি স্মার্ট সমাধান।</p>
                </div>
                <div class="feature-item">
                    <h4>আপনার বেনিফিট কী?</h4>
                    <p>আপনার সময় বাঁচবে। গেস্টরা নিজেরাই ওয়েবসাইট থেকে ফাঁকা তারিখ দেখে বুকিং রিকোয়েস্ট পাঠাবে। একই তারিখে ভুলে দুইজনকে বোট বুকিং দেওয়ার (ওভারবুকিং) কোনো রিস্ক থাকবে না।</p>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
`;

fs.writeFileSync('tmp/5page_brochure.html', htmlContent);
console.log('HTML created successfully!');
