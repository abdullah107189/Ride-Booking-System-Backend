import z from "zod";

export const loginAuthZodSchema = z.object({
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
});
