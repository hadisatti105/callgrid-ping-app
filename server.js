import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CallGrid API
const BASE_URL =
  "https://bid.callgrid.com/api/ping/cmmw7umjt010h07licbksivxn";

// Health check
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Server is working" });
});

// API route
app.post("/api/ping", async (req, res) => {
  try {
    const { callerId } = req.body;

    if (!callerId) {
      return res.status(400).json({
        success: false,
        error: "callerId is required",
      });
    }

    const url = `${BASE_URL}?CallerId=${encodeURIComponent(callerId)}`;

    const response = await fetch(url);

    const text = await response.text();

    // Ensure JSON response
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Invalid response from external API",
        raw: text
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// JSON 404 (IMPORTANT FIX)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});