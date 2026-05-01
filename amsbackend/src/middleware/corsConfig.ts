import cors from "cors";

const corsOptions = cors({
  origin: [
    "http://localhost:3000",
    "https://ampt.online",
    "https://www.ampt.online"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "X-Requested-With"
  ],
  credentials: true
});

export default corsOptions;
