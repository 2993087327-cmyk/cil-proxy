import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const target = "https://generativelanguage.googleapis.com"; // Gemini
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_, res) => res.json({ ok: true, service: "cil-proxy", ts: Date.now() }));

app.use((req, _res, next) => {
  if (!req.query.key && API_KEY) {
    req.url += (req.url.includes("?") ? "&" : "?") + "key=" + API_KEY;
  }
  next();
});

app.use(
  ["/v1beta", "/v1"],
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { "^/": "/" },
    onProxyReq(proxyReq) {
      proxyReq.setHeader("x-goog-api-client", "cil-proxy");
    }
  })
);

app.use((_, res) => res.status(404).json({ error: "Not found" }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CIL proxy on :${PORT}`));
