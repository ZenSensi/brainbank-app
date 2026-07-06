import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import path from "path";
import fs from "fs";

import paymentRoutes from "./routes/payments";
import contentRoutes from "./routes/content";
import userRoutes from "./routes/users";
import seedRoutes from "./routes/seed";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req, res) => {
  try {
    const htmlPath = path.join(__dirname, "landing.html");
    if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.send("<h1>Brain Bank API is running</h1>");
    }
  } catch (error) {
    res.status(500).send("Error loading landing page");
  }
});

app.get("/contact", (_req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/terms", (_req, res) => {
  res.sendFile(path.join(__dirname, "terms.html"));
});

app.get("/privacy", (_req, res) => {
  res.sendFile(path.join(__dirname, "privacy.html"));
});

app.get("/refunds", (_req, res) => {
  res.sendFile(path.join(__dirname, "refunds.html"));
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/payments", paymentRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seed", seedRoutes);

app.listen(PORT, () => {
  console.log(`Brain Bank API running on port ${PORT}`);
});

export default app;
