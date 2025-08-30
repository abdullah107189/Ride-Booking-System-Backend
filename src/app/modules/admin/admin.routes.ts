import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { adminController } from "./admin.controllers";

const router = Router();
router.get("/getAllUser", adminController.getAllUser);
router.get("/getAllRide", adminController.getAllRide);
router.patch(
  "/changeBlockStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeBlockStatus
);
router.patch(
  "/rides/:id/cancel",
  checkAuth(ROLE.admin),
  adminController.cancelRide
);
router.patch(
  "/changeApproveStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeApproveStatus
);

export const AdminRoutes = router;
