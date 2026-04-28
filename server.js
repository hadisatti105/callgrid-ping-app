import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render requires dynamic port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CallGrid API base URL
const BASE_URL =
  "https://bid.callgrid.com/api/ping/cmmw7umjt010h07licbksivxn";

// Health check route (useful for testing)
app.get("/test", (req, res) => {
  res.send("✅ Server is working");
});

// API route
app.post("/api/ping", async (req, res) => {
  try {
    const { callerId } = req.body;

    // Validation
    if (!callerId || typeof callerId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid callerId is required",
      });
    }

    // Build external API URL
    const url = `${BASE_URL}?CallerId=${encodeURIComponent(callerId)}`;

    const response = await fetch(url, {
      method: "GET",
      timeout: 10000,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `External API error: ${response.status}`,
      });
    }

    const data = await response.json();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Root route (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all for unknown routes (prevents ugly crashes)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});