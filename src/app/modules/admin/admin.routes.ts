import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { adminController } from "./admin.controllers";

const router = Router();
router.patch(
  "/changeBlockStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeBlockStatus
);
router.get('/getAllUser', adminController.getAllUser)
router.patch(
  "/changeApproveStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeApproveStatus
);

export const AdminRoutes = router;
