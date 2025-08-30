import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validationRequest";
import { createUserZodSchema } from "../user/user.validation";
import { loginAuthZodSchema } from "./auth.validation";

const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AuthController.createUser
);
router.post(
  "/login",
  validateRequest(loginAuthZodSchema),
  AuthController.loginUser
);

router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.userLogout);
export const AuthRoutes = router;
