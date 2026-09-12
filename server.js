const express = require("express");
const app = express();
app.use(express.json());
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "carbot123";
// ======================================== // الصفحة الرئيسية // ========================================
app.get("/", (req, res) => { res.send("Car Bot is running 🚗"); });
// ======================================== // Webhook verification من Meta // ========================================
app.get("/webhook", (req, res) => { const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];
if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("Webhook verified"); return res.status(200).send(challenge); }
return res.sendStatus(403); });
// ======================================== // استقبال أحداث Meta // ========================================
app.post("/webhook", (req, res) => { console.log( "Webhook event:", JSON.stringify(req.body, null, 2) );
res.sendStatus(200); });
// ======================================== // سياسة الخصوصية // ========================================
app.get("/privacy-policy", (req, res) => { res.send(`
<meta name="viewport" content="width=device-width, initial-scale=1.0"
// ======================================== // تشغيل السيرفر // ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(Car Bot running on port ${PORT}); });