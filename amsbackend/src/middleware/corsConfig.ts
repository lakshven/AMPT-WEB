import cors from "cors";

const corsOptions = cors({
  origin: [
    "http://localhost:3000",
    "http://ampt.online:3000",
    "http://www.ampt.online:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "X-Requested-With"
  ],
  credentials: false
});

export default corsOptions;