import { z } from "zod";
import { Dictionary } from "../utils";

export const getEmailResourceFormSchema = (dict: Dictionary) =>
  z.object({
    email: z
      .string()
      .email({ message: dict.errors.invalid_email || "Invalid email address" }),
  });
