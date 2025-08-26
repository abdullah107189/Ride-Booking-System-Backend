import { Router } from "express";
import { AuthControllers } from "./auth.controllers";
import { validateRequest } from "../../middlewares/validationRequest";
import { createUserZodSchema } from "../user/user.validation";

const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AuthControllers.createUser
);
export const AuthRoutes = router;
