import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { adminController } from "./admin.controller";

const router = Router();
router.get("/getAllUser", checkAuth(ROLE.admin), adminController.getAllUser);
router.get("/getAllRide", checkAuth(ROLE.admin), adminController.getAllRide);
router.patch(
  "/changeBlockStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeBlockStatus
);
router.patch(
  "/change-online-status/:userId",
  checkAuth(ROLE.admin),
  adminController.changeOnlineStatus
);
router.patch(
  "/rides/:id/cancel",
  checkAuth(ROLE.admin),
  adminController.cancelRide
);
router.patch(
  "/approve-driver/:id",
  checkAuth(ROLE.admin),
  adminController.approveDriver
);
router.get(
  "/pending-approvals",
  checkAuth(ROLE.admin),
  adminController.getPendingApprovals
);
router.patch(
  "/reject-driver/:id",
  checkAuth(ROLE.admin),
  adminController.rejectDriver
);
router.get(
  "/earnings-stats",
  checkAuth(ROLE.admin),
  adminController.getEarningsStats
);

export const AdminRoutes = router;
