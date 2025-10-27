import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/router";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import notFound from "./app/middlewares/notFound";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://ride-booking-system-frontend-omega.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/usersData", async (req: Request, res: Response) => {
  res.status(200).json({ message: "welcome to ride booking system" });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "welcome to ride booking system" });
});

app.use(globalErrorHandler);
app.use(notFound);
export default app;
