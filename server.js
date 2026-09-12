const express = require("express");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "carbot123";
const PAGE_ID = process.env.PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("Car Bot is running 🚗");
});

// التحقق من Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// استقبال أحداث Meta
app.post("/webhook", (req, res) => {
  console.log("Webhook event:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// سياسة الخصوصية
app.get("/privacy-policy", (req, res) => {
  res.send(
    "<html><head><meta charset='UTF-8'><title>سياسة الخصوصية - Car Bot</title></head><body dir='rtl'>" +
    "<h1>سياسة الخصوصية - Car Bot</h1>" +
    "<p>يستخدم تطبيق Car Bot لإدارة التعليقات والرسائل المتعلقة بمنشورات السيارات.</p>" +
    "<h2>المعلومات التي تتم معالجتها</h2>" +
    "<p>قد يعالج التطبيق المعلومات المرتبطة بتعليقات ورسائل مستخدمي الصفحة بهدف الرد على الاستفسارات وتقديم معلومات السيارات.</p>" +
    "<h2>استخدام المعلومات</h2>" +
    "<p>تستخدم المعلومات فقط لتشغيل وظائف التطبيق والرد على استفسارات المستخدمين.</p>" +
    "<h2>حماية المعلومات</h2>" +
    "<p>نتخذ إجراءات مناسبة للمساعدة في حماية المعلومات.</p>" +
    "<h2>التواصل</h2>" +
    "<p>للاستفسارات المتعلقة بالخصوصية يمكن التواصل مع مسؤول التطبيق.</p>" +
    "<p>آخر تحديث: 2026</p>" +
    "</body></html>"
  );
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Car Bot running on port " + PORT);
});