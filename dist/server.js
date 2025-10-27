"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./app/config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
let server;
const port = process.env.PORT || 3000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const uri = "mongodb://localhost:27017/ride-management-system";
        const uri = env_1.envVars.DB_URL;
        if (!uri) {
            throw new Error("Database URL is not defined in environment variables.");
        }
        yield mongoose_1.default.connect(uri);
        console.log("server connected");
        server = app_1.default.listen(env_1.envVars.PORT, () => {
            console.log(`🚀 Server running in ${env_1.envVars.NODE_DEV} mode on port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
}))();
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
