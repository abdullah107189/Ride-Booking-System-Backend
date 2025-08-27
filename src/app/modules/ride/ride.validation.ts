import { z } from "zod";
import { RideStatus } from "./ride.interface";

export const rideZodSchema = z.object({
  rider: z.string("Invalid rider ID."),
  driver: z.string("Invalid driver ID.").optional(),
  pickupLocation: z.object({
    address: z.string().min(5, "Address must be at least 5 characters long."),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  destinationLocation: z.object({
    address: z.string().min(5, "Address must be at least 5 characters long."),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  status: z
    .enum(Object.values(RideStatus) as [string, ...string[]])

    .default(RideStatus.requested)
    .optional(),
  statusHistory: z
    .array(
      z.object({
        updateStatus: z.enum(
          Object.values(RideStatus) as [string, ...string[]]
        ),
        timestamp: z.string().datetime().optional(),
      })
    )
    .optional(),
});
