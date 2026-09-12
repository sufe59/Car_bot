const express = require("express");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "carbot123";
const PAGE_ID = process.env.PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const GRAPH_API_VERSION = "v26.0";

// Meta

const CARS = {
  "PUT_POST_ID_HERE": {
    name: "Toyota Camry 2022",
    price: "25,000,000 دينار",
    location: "بغداد",
    details: "السيارة بحالة جيدة، والاستفسار عن باقي التفاصيل عبر الخاص."
  }
};

const processedComments = new Set();

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[؟?!.,،]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCarQuestion(text) {
  const message = normalizeText(text);

  const keywords = [
    "السعر",
    "سعر",
    "شكد",
    "بكم",
    "كم السعر",
    "وين",
    "مكان",
    "متوفر",
    "متوفرة",
    "موجود",
    "موجودة",
    "تفاصيل",
    "مواصفات",
    "معلومات"
  ];

  return keywords.some((keyword) => message.includes(keyword));
}

async function replyToComment(commentId, message) {
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message,
      access_token: PAGE_ACCESS_TOKEN
    })
  });

  const data = await response.json();

  console.log("Comment reply:", JSON.stringify(data, null, 2));

  return data;
}

async function sendPrivateReply(commentId, message) {
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/private_replies`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message,
      access_token: PAGE_ACCESS_TOKEN
    })
  });

  const data = await response.json();

  console.log("Private reply:", JSON.stringify(data, null, 2));

  return data;
}

function buildCarMessage(car) {
  return (
    "هلا بيك 🌹\n\n" +
    "🚗 السيارة: " + car.name + "\n" +
    "💰 السعر: " + car.price + "\n" +
    "📍 الموقع: " + car.location + "\n" +
    "ℹ️ التفاصيل: " + car.details
  );
}

async function processComment(value) {
  const commentId = value.comment_id;
  const postId = value.post_id;
  const message = value.message || "";

  if (!commentId || !postId) {
    return;
  }

  if (processedComments.has(commentId)) {
    return;
  }

  if (!isCarQuestion(message)) {
    return;
  }

  const car = CARS[postId];

  if (!car) {
    console.log("No car found for post:", postId);
    return;
  }

  processedComments.add(commentId);

  const privateMessage = buildCarMessage(car);

  try {
    await replyToComment(
      commentId,
      "تم إرسال تفاصيل السيارة إلى الخاص 🚗"
    );
  } catch (error) {
    console.error("Public reply error:", error);
  }

  try {
    await sendPrivateReply(commentId, privateMessage);
  } catch (error) {
    console.error("Private reply error:", error);
  }
}

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
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta

app.post("/webhook", (req, res) => {
  res.sendStatus(200);

  const body = req.body;

  console.log(
    "Webhook event:",
    JSON.stringify(body, null, 2)
  );

  if (body.object !== "page") {
    return;
  }

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "feed") {
        continue;
      }

      const value = change.value || {};

      if (value.item !== "comment") {
        continue;
      }

      if (value.verb && value.verb !== "add") {
        continue;
      }

      processComment(value).catch((error) => {
        console.error("Process comment error:", error);
      });
    }
  }
});

// سياسة الخصوصية

app.get("/privacy-policy", (req, res) => {
  res.send(
    "<html><head><meta charset='UTF-8'><title>سياسة الخصوصية - Car Bot</title></head>" +
    "<body dir='rtl'>" +
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