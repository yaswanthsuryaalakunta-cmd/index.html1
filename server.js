
const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Create the database automatically
const db = new Database("portfolio.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

// API: check if backend is running
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Portfolio backend is running" });
});

// API: portfolio information
app.get("/api/portfolio", (req, res) => {
  res.json({
    name: "Alakunta Yaswanth Surya",
    degree: "B.Tech in Electrical and Electronics Engineering",
    skills: ["Java", "HTML", "CSS", "JavaScript", "Arduino UNO"],
    email: "yaswanthsuryaalakunta@gmail.com"
  });
});

// Limit repeated contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: "Too many requests. Please try again later." }
});

// API: save contact messages
app.post("/api/contact", contactLimiter, (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (![name, email, subject, message].every(
    value => typeof value === "string" && value.trim()
  )) {
    return res.status(400).json({
      error: "Please fill in all fields."
    });
  }

  const data = {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim()
  };

  if (
    data.name.length > 80 ||
    data.email.length > 254 ||
    data.subject.length > 120 ||
    data.message.length > 3000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    return res.status(400).json({
      error: "Please check your input and email address."
    });
  }

  try {
    const save = db.prepare(`
      INSERT INTO messages (name, email, subject, message)
      VALUES (@name, @email, @subject, @message)
    `);

    save.run(data);

    res.status(201).json({
      success: true,
      message: "Your message was saved successfully!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Unable to save your message."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
