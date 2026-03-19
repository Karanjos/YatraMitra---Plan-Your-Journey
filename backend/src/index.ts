import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://13.63.151.1", // Match the origin in your error message
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date() });
});

import authRoutes from "./routes/auth";
import tripRoutes from "./routes/trips";
import bookingRoutes from "./routes/bookings";
import paymentRoutes from "./routes/payments";

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
