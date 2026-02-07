import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const transferSchema = z.object({
  from_account_id: z.number({ message: "Select source account" }),
  to_account_id: z.coerce
    .number()
    .int()
    .positive("Enter a valid recipient account ID"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use up to 2 decimal places")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
});

export const exchangeSchema = z.object({
  from_account_id: z.number({ message: "Select source currency" }),
  to_account_id: z.number({ message: "Select target currency" }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use up to 2 decimal places")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
