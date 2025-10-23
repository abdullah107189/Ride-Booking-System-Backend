import { z } from "zod";
import { RideStatus } from "./ride.interface";

export const rideZodSchema = z.object({
  rider: z.string("Invalid rider ID."),
  driver: z.string("Invalid driver ID.").optional(),
  pickupLocation: z.object({
    location: z.object({
      type: z.literal("Point"),
      coordinates: z.array(z.number()).length(2),
    }),
    address: z.string().min(5, "Address must be at least 5 characters long."),
  }),

  destinationLocation: z.object({
    location: z.object({
      type: z.literal("Point"),
      coordinates: z.array(z.number()).length(2),
    }),
    address: z.string().min(5, "Address must be at least 5 characters long."),
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
  fare: z.number().optional(),
});
