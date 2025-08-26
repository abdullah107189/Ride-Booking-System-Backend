import mongoose from "mongoose";
import { Server } from "http";
import app from "./app";
const port = 3000;
let server: Server;
const startServer = async () => {
  try {
    const url = "";
    if (!url) {
      throw new Error("Database URL is not defined in environment variables.");
    }
    await mongoose.connect("");
    console.log("server connected");
    server = app.listen(port, () => {
      console.log(`Server is listening on port :-- ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
})();

// when promise rejection error
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shuting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// when local error
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shuting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// when could main owner singer throw for shout down server signal, and it's not error !
process.on("SIGTERM", () => {
  console.log("Sigterm received... Server shuting down...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
