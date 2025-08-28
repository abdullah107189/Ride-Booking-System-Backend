import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "./user.interface";
const router = Router();
router.get("/me", checkAuth(ROLE.driver, ROLE.rider), userController.findMe);
export const UserRoutes = router;
