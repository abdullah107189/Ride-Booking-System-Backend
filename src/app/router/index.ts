import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

export const router = Router();
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
];
