const fs = require('fs');
const path = require('path');

function getBase64Image(filename) {
    const filePath = path.join(__dirname, '..', 'tmp', 'brochure_screenshots', filename);
    if (!fs.existsSync(filePath)) return '';
    const file = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${file.toString('base64')}`;
}

const htmlContent = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Premium Houseboat Solution Pitch Deck</title>
    <style>
        /* Modern Corporate Brochure Styles */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');

        body {
            font-family: 'Inter', 'Noto Sans Bengali', sans-serif;
            line-height: 1.7;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
        }

        .page {
            width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 60px;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
        }
        
        .page:last-child {
            page-break-after: auto;
        }

        /* Typography */
        h1 {
            font-size: 42px;
            color: #0f172a;
            margin-bottom: 10px;
            font-weight: 800;
            line-height: 1.2;
        }
        h2 {
            font-size: 32px;
            color: #0369a1;
            border-bottom: 3px solid #bae6fd;
            padding-bottom: 15px;
            margin-top: 20px;
            margin-bottom: 30px;
        }
        h3 {
            font-size: 24px;
            color: #1e293b;
            margin-top: 40px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        h3::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 24px;
            background: #0ea5e9;
            border-radius: 4px;
        }
        p {
            font-size: 17px;
            color: #334155;
            margin-bottom: 20px;
        }
        
        .highlight {
            color: #0284c7;
            font-weight: 600;
        }

        /* Cover Page */
        .cover-header {
            text-align: center;
            padding: 40px 0;
        }
        .cover-subtitle {
            font-size: 22px;
            color: #64748b;
            margin-bottom: 50px;
        }

        /* Feature Boxes */
        .feature-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 6px solid #0ea5e9;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .feature-box h4 {
            margin-top: 0;
            color: #0369a1;
            font-size: 20px;
            margin-bottom: 10px;
        }

        /* Images inside content */
        .screenshot-container {
            margin: 35px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
            border: 1px solid #cbd5e1;
            background: #f8fafc;
        }
        .screenshot-container img {
            width: 100%;
            display: block;
        }
        .screenshot-caption {
            background: #f1f5f9;
            padding: 12px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        /* Pricing & Contact */
        .pricing-card {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            margin: 40px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .pricing-card h3 {
            color: white;
        }
        .pricing-card h3::before {
            background: #38bdf8;
        }
        .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .price-row:last-child {
            border-bottom: none;
        }
        .price-title {
            font-size: 20px;
            font-weight: 600;
        }
        .price-desc {
            font-size: 14px;
            color: #94a3b8;
            max-width: 300px;
        }
        .price-amount {
            font-size: 28px;
            font-weight: 800;
            color: #38bdf8;
        }

        .contact-section {
            text-align: center;
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px dashed #cbd5e1;
        }
        .phone {
            font-size: 36px;
            font-weight: 800;
            color: #0284c7;
            margin: 15px 0;
        }
    </style>
</head>
<body>

    <!-- PAGE 1: Cover -->
    <div class="page">
        <div class="cover-header">
            <h1>Premium Houseboat Solution</h1>
            <div class="cover-subtitle">টাঙ্গুয়ার হাওরের হাউসবোট ব্যবসার সম্পূর্ণ ডিজিটাল রূপান্তর</div>
            
            <div class="screenshot-container">
                <img src="${getBase64Image('1_hero.jpg')}" alt="Website Hero Section">
            </div>
        </div>

        <div class="feature-box">
            <h4>কেন আপনার এই সিস্টেমটি প্রয়োজন?</h4>
            <p>বর্তমান ডিজিটাল যুগে শুধু ফেসবুক পেইজ বা মেসেঞ্জার দিয়ে হাউসবোটের বুকিং ম্যানেজ করা অত্যন্ত কঠিন। ডাবল বুকিং হওয়া, পেমেন্টের সঠিক হিসাব না থাকা এবং কাস্টমারদের কাছে প্রফেশনাল ইমেজ তৈরি না হওয়ার মতো সমস্যাগুলো নিত্যদিনের।</p>
            <p>আমাদের <strong>Premium Houseboat Solution</strong> আপনাকে দিচ্ছে একটি বিশ্বমানের ওয়েবসাইট এবং অত্যন্ত সিকিউরড অ্যাডমিন প্যানেল, যার মাধ্যমে পুরো ব্যবসা আপনার হাতের মুঠোয় চলে আসবে।</p>
        </div>
    </div>

    <!-- PAGE 2: Frontend 1 -->
    <div class="page">
        <h2>অতিথিদের জন্য ওয়েবসাইট (Frontend)</h2>
        <p>আপনার গেস্টরা ওয়েবসাইটে প্রবেশ করলেই একটি প্রিমিয়াম এবং বিশ্বাসযোগ্য অভিজ্ঞতা পাবেন। এতে আপনার ব্র্যান্ড ভ্যালু বহুগুণ বেড়ে যাবে।</p>

        <h3>১. আকর্ষণীয় হিরো সেকশন ও পরিচিতি</h3>
        <p>ওয়েবসাইটের শুরুতেই আপনার হাউসবোটের চমৎকার সব ছবি ও ভিডিও থাকবে। গেস্টরা সহজেই আপনার হাউসবোটের ফিচার এবং সুযোগ-সুবিধাগুলো এক নজরে দেখে নিতে পারবেন।</p>
        
        <h3>২. প্যাকেজ ও ডেস্টিনেশন শোকেস</h3>
        <p>আপনার হাউসবোটের বিভিন্ন প্যাকেজ (যেমন: ১ রাত ২ দিনের প্যাকেজ), কেবিনের ধরন (মাস্টার বেড, কাপল কেবিন) এবং ডেস্টিনেশনগুলো (যেমন: নীলাদ্রি লেক, যাদুকাটা নদী) বিস্তারিতভাবে সাজানো থাকবে।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('2_packages.jpg')}" alt="Packages Section">
            <div class="screenshot-caption">প্যাকেজ এবং কেবিনের বিস্তারিত তথ্যের সেকশন</div>
        </div>
        <p><strong>সুবিধা:</strong> গেস্টদের বারবার মেসেঞ্জারে প্যাকেজের বিস্তারিত বা ছবি পাঠাতে হবে না। তারা ওয়েবসাইট থেকেই সবকিছু পরিষ্কারভাবে বুঝতে পারবেন।</p>
    </div>

    <!-- PAGE 3: Frontend 2 -->
    <div class="page">
        <h3>৩. সরাসরি অনলাইন বুকিং রিকোয়েস্ট</h3>
        <p>গেস্টরা ওয়েবসাইটে ক্যালেন্ডার দেখে ফাঁকা তারিখ সিলেক্ট করে সরাসরি বুকিং রিকোয়েস্ট পাঠাতে পারবেন। তারা কতজন যাবেন, কোন কেবিন নিবেন তা সিলেক্ট করলেই স্বয়ংক্রিয়ভাবে মোট খরচ হিসাব হয়ে যাবে।</p>
        
        <div class="feature-box">
            <h4>বুকিং প্রসেসটি কীভাবে কাজ করে?</h4>
            <ol>
                <li>গেস্ট তারিখ ও গেস্ট সংখ্যা সিলেক্ট করবেন।</li>
                <li>ফর্মটি সাবমিট করার সাথে সাথেই আপনার অ্যাডমিন প্যানেলে একটি নোটিফিকেশন চলে আসবে।</li>
                <li>আপনি বুকিংটি যাচাই করে কনফার্ম করলে বা পেমেন্ট রিসিভ করলে গেস্টের বুকিংটি পাকা হবে।</li>
            </ol>
        </div>
        
        <h3>৪. দৃষ্টিনন্দন গ্যালারি</h3>
        <p>আপনার হাউসবোটের ভেতরের এবং বাইরের প্রিমিয়াম ছবিগুলো গ্যালারিতে সুন্দরভাবে সাজানো থাকবে, যা গেস্টদের আকৃষ্ট করতে দারুণ ভূমিকা রাখবে।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('3_destinations.jpg')}" alt="Gallery Section">
            <div class="screenshot-caption">হাউসবোটের গ্যালারি ও ডেস্টিনেশন সেকশন</div>
        </div>
    </div>

    <!-- PAGE 4: Admin Login -->
    <div class="page">
        <h2>মালিকদের জন্য অ্যাডমিন প্যানেল (Backend)</h2>
        <p>পুরো ব্যবসাটি পরিচালনা করার জন্য আপনার কাছে থাকবে ১০০% সিকিউরড একটি ড্যাশবোর্ড, যা শুধুমাত্র আপনি এবং আপনার স্টাফরা অ্যাক্সেস করতে পারবেন।</p>

        <h3>১. ১০০% সিকিউরড লগইন পোর্টাল</h3>
        <p>অ্যাডমিন প্যানেলে প্রবেশের জন্য একটি অত্যন্ত সুরক্ষিত লগইন পোর্টাল থাকবে। আপনার ইমেইল এবং পাসওয়ার্ড ছাড়া অন্য কেউই এখানে প্রবেশ করতে পারবে না।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('4_admin_login.jpg')}" alt="Secure Login Portal">
            <div class="screenshot-caption">অ্যাডমিন প্যানেলের সুরক্ষিত লগইন পেইজ</div>
        </div>
        <p><strong>ডেটা প্রাইভেসি:</strong> আপনার বুকিং, কাস্টমারদের তথ্য এবং আর্থিক হিসাব সম্পূর্ণ প্রাইভেট থাকবে। আপনার অনুমতি ছাড়া অন্য কোনো মালিক বা তৃতীয় পক্ষ কোনোভাবেই আপনার ডেটা দেখতে পারবেআগরে না।</p>
    </div>

    <!-- PAGE 5: Admin Dashboard -->
    <div class="page">
        <h3>২. ওভারভিউ ড্যাশবোর্ড</h3>
        <p>লগইন করার সাথে সাথেই আপনি পুরো মাসের বা বর্তমান সময়ের একটি ওভারভিউ দেখতে পাবেন। এখানে আজকের বুকিং, মোট আয়, পেন্ডিং রিকোয়েস্ট এবং কোন প্যাকেজগুলো বেশি বুক হচ্ছে তা গ্রাফের মাধ্যমে সুন্দরভাবে তুলে ধরা হবে।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('5_admin_dashboard.jpg')}" alt="Admin Dashboard Overview">
            <div class="screenshot-caption">অ্যাডমিন ড্যাশবোর্ডে আয় এবং বুকিংয়ের পরিসংখ্যান</div>
        </div>
        <p><strong>সুবিধা:</strong> খাতা-কলমের হিসাবের দিন শেষ! এক ক্লিকেই আপনি বুঝতে পারবেন আপনার ব্যবসা কতটা লাভজনক হচ্ছে এবং কবে কোন ট্রিপ আছে।</p>
    </div>

    <!-- PAGE 6: Admin Bookings & Calendar -->
    <div class="page">
        <h3>৩. বুকিং ও পেমেন্ট ম্যানেজমেন্ট</h3>
        <p>ওয়েবসাইট থেকে আসা সমস্ত বুকিং রিকোয়েস্ট আপনি এখানে দেখতে পাবেন। আপনি চাইলে নতুন বুকিং যোগ করতে পারবেন, ক্যান্সেল করতে পারবেন বা পেমেন্টের আপডেট (Partial/Full Payment) রাখতে পারবেন।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('6_admin_bookings.jpg')}" alt="Bookings Management">
            <div class="screenshot-caption">বুকিং এবং পেমেন্ট ট্র্যাকিং সিস্টেম</div>
        </div>

        <h3>৪. ইন্টারেক্টিভ অ্যাভেইলেবিলিটি ক্যালেন্ডার</h3>
        <p>কোন তারিখে আপনার বোট বুকড আছে আর কবে ফাঁকা আছে, তা একটি বিশাল ক্যালেন্ডারে রঙের মাধ্যমে চিহ্নিত থাকবে। আপনি চাইলে কোনো নির্দিষ্ট তারিখে ম্যানুয়ালি বোট ব্লক করেও রাখতে পারবেন।</p>
        <div class="screenshot-container">
            <img src="${getBase64Image('7_admin_availability.jpg')}" alt="Availability Calendar">
            <div class="screenshot-caption">অ্যাভেইলেবিলিটি ক্যালেন্ডার ও ডেট ব্লকিং</div>
        </div>
    </div>

    <!-- PAGE 7: Pricing & Contact -->
    <div class="page">
        <h2>প্রাইসিং ও প্যাকেজ</h2>
        <p>আপনার ব্যবসাকে আরও প্রফেশনাল এবং ঝামেলামুক্ত করতে আমরা দিচ্ছি অত্যন্ত সাশ্রয়ী প্যাকেজ।</p>

        <div class="pricing-card">
            <div class="price-row">
                <div>
                    <div class="price-title">ফুল সেটআপ চার্জ (One-time)</div>
                    <div class="price-desc">সিস্টেম ইন্সটলেশন, প্রিমিয়াম ডিজাইন, আপনার ডেটা এন্ট্রি এবং সিকিউরড ডাটাবেস সেটআপ।</div>
                </div>
                <div class="price-amount">৩০,০০০ ৳</div>
            </div>
            <div class="price-row">
                <div>
                    <div class="price-title">হোস্টিং ও মেইনটেনেন্স (বাৎসরিক)</div>
                    <div class="price-desc">সার্ভার হোস্টিং, সিকিউরিটি আপডেট, ডাটা ব্যাকআপ এবং টেকনিক্যাল সাপোর্ট।</div>
                </div>
                <div class="price-amount">৫,০০০ ৳ <span style="font-size:14px; color:#cbd5e1;">/ বছর</span></div>
            </div>
        </div>

        <div class="feature-box">
            <h4>কেন আমাদের বেছে নেবেন?</h4>
            <ul>
                <li>১০০% মোবাইল ফ্রেন্ডলি ডিজাইন (মোবাইল থেকেই অ্যাডমিন প্যানেল চালানো যাবে)।</li>
                <li>দ্রুত গতির ও অত্যন্ত সুরক্ষিত ক্লাউড সার্ভার।</li>
                <li>২৪/৭ টেকনিক্যাল সাপোর্ট।</li>
            </ul>
        </div>

        <div class="contact-section">
            <h2>আজই আপনার ব্যবসাকে ডিজিটাল করুন!</h2>
            <p>আপনার হাউসবোটের জন্য এই ডেমো সিস্টেমটি লাইভ দেখতে বা বিস্তারিত আলোচনা করতে সরাসরি কল করুন:</p>
            <div class="phone">01736625982</div>
            <p style="color: #64748b; font-weight: 600;">Premium Houseboat Solution</p>
        </div>
    </div>

</body>
</html>
`;

fs.writeFileSync('tmp/brochure.html', htmlContent);
console.log('HTML created successfully!');
