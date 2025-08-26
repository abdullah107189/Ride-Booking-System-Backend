import z from "zod";

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
  role: z.string("Role must be a string"),
});
