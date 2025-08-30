import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { DriverRoutes } from "../modules/driver/driver.routes";
import { RiderRoutes } from "../modules/ride/ride.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";

export const router = Router();
const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/drivers",
    route: DriverRoutes,
  },
  {
    path: "/rides",
    route: RiderRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
