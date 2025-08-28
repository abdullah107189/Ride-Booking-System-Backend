import { Router } from "express";
import { AuthControllers } from "./auth.controllers";
import { validateRequest } from "../../middlewares/validationRequest";
import { createUserZodSchema } from "../user/user.validation";
import { loginAuthZodSchema } from "./auth.validation";

const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AuthControllers.createUser
);
router.post(
  "/login",
  validateRequest(loginAuthZodSchema),
  AuthControllers.loginUser
);
export const AuthRoutes = router;
