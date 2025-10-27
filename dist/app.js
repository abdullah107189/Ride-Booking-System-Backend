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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./app/router");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "https://ride-booking-system-frontend-omega.vercel.app",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", router_1.router);
app.get("/usersData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "welcome to ride booking system" });
}));
app.get("/", (req, res) => {
    res.status(200).json({ message: "welcome to ride booking system" });
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
