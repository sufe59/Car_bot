const express = require("express");
const app = express();
app.use(express.json());
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "carbot123";
// ======================================== // الصفحة الرئيسية - اختبار السيرفر // ========================================
app.get("/", (req, res) => { res.send("Car Bot is running 🚗"); });
// ======================================== // Webhook verification من Meta // ========================================
app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];
if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("Webhook verified"); return res.status(200).send(challenge); }
return res.sendStatus(403); });
// ======================================== // استقبال أحداث Meta // ========================================
app.post("/webhook", (req, res) => { console.log( "Webhook event:", JSON.stringify(req.body, null, 2) );
res.sendStatus(200); });
// ======================================== // سياسة الخصوصية // ========================================
app.get("/privacy-policy", (req, res) => { res.send(` <!DOCTYPE html> <html lang="ar" dir="rtl"> <head> <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>سياسة الخصوصية - Car Bot</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }

    h1 {
      margin-bottom: 30px;
    }

    h2 {
      margin-top: 30px;
    }
  </style>
</head>

<body>

  <h1>سياسة الخصوصية - Car Bot</h1>

  <p>
    يستخدم تطبيق Car Bot لإدارة التعليقات والرسائل
    المتعلقة بمنشورات السيارات على صفحات فيسبوك.
  </p>

  <h2>المعلومات التي تتم معالجتها</h2>

  <p>
    قد يعالج التطبيق المعلومات المرتبطة بتعليقات
    ورسائل مستخدمي الصفحة، وذلك بهدف الرد على
    الاستفسارات وتقديم معلومات السيارات.
  </p>

  <h2>استخدام المعلومات</h2>

  <p>
    تستخدم المعلومات فقط لتشغيل وظائف التطبيق
    والرد على استفسارات المستخدمين المتعلقة
    بمنشورات السيارات.
  </p>

  <h2>حماية المعلومات</h2>

  <p>
    نتخذ إجراءات مناسبة للمساعدة في حماية
    المعلومات من الوصول غير المصرح به.
  </p>

  <h2>مشاركة المعلومات</h2>

  <p>
    لا يتم بيع المعلومات الشخصية أو استخدامها
    لأغراض إعلانية من خلال هذا التطبيق.
  </p>

  <h2>التواصل</h2>

  <p>
    للاستفسارات المتعلقة بالخصوصية أو استخدام
    التطبيق، يمكن التواصل مع مسؤول التطبيق.
  </p>

  <h2>آخر تحديث</h2>

  <p>
    2026
  </p>

</body>
</html>
`); });
// ======================================== // تشغيل السيرفر // ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(Car Bot running on port ${PORT}); });