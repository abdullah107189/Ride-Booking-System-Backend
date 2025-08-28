import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/router";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "welcome to ride booking system" });
});

app.use(globalErrorHandler);
export default app;
