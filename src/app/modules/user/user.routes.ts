import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "./user.interface";
import { validateRequest } from "../../middlewares/validationRequest";
import { updateUserZodSchema } from "./user.validation";
const router = Router();

router.get("/me", checkAuth(...Object.values(ROLE)), userController.findMe);
router.patch(
  "/updateOwnProfile",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(ROLE)),
  userController.updateOwnProfile
);
router.patch(
  "/changeOnlineStatus",
  checkAuth(...Object.values(ROLE)),
  userController.changeOnlineStatus
);
router.patch(
  "/change-password",
  checkAuth(...Object.values(ROLE)),
  userController.changePassword
);

export const UserRoutes = router;
