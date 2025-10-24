import z from "zod";

const vehicleInfoZodSchema = z.object({
  licensePlate: z
    .string()
    .nonempty("License Plate is required.")
    .regex(/^[A-Z0-9-]*$/, "Invalid license plate format."),
  model: z.string().nonempty("Model is required."),
  carType: z.enum(["car", "bike", "cng"]).default("car"),
});

const currentLocationInnerSchema = z.object({
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.array(z.number()).length(2),
    })
    .nullable()
    .optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters long.")
    .nonempty("Address is required for location.")
    .optional(),
});

export const earningZodSchema = z.object({
  rideId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid Ride ID format (expected MongoDB ObjectId)",
  }),
  amount: z.number().min(0),
  date: z.string().datetime(),
});

export const createUserZodSchema = z.object({
  name: z
    .string("Name must be a string.")
    .nonempty("Name is required")
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string("Email must be a string.")
    .email("Invalid email address format.")
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string("Password must be a string.")
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),

  phone: z
    .string("Phone Number must be a string")
    .regex(/^(?:\+8801|\(8801\)|01)[13-9]\d{8}$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  role: z.enum(["rider", "driver", "admin"], {
    message: "Invalid role specified.",
  }),
  vehicleInfo: vehicleInfoZodSchema.optional(),
  currentLocation: currentLocationInnerSchema.optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string("Name must be a string.")
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),

  email: z
    .string("Email must be a string.")
    .email("Invalid email address format.")
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .optional(),

  password: z
    .string("Password must be a string.")
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    })
    .optional(),

  phone: z
    .string("Phone Number must be a string")
    .regex(/^(?:\+8801|\(8801\)|01)[13-9]\d{8}$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  role: z.enum(["rider", "driver", "admin"]).optional(),
  isApproved: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  totalEarnings: z.number().optional(),
  earnings: z.array(earningZodSchema).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalRides: z.number().optional(),
  vehicleInfo: vehicleInfoZodSchema.nullable().optional(),
  currentLocation: currentLocationInnerSchema.nullable().optional(),
});
