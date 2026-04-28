import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CallGrid API base URL
const BASE_URL =
  "https://bid.callgrid.com/api/ping/cmmw7umjt010h07licbksivxn";

// API endpoint
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

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});