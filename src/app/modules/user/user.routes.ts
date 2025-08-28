import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "./user.interface";
import { validateRequest } from "../../middlewares/validationRequest";
import { updateUserZodSchema } from "./user.validation";
const router = Router();
router.get("/me", checkAuth(ROLE.driver, ROLE.rider), userController.findMe);

router.patch(
  "/updateOwnProfile",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(ROLE)),
  userController.updateOwnProfile
);
export const UserRoutes = router;
