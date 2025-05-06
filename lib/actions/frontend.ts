"use server";

import { getEmailResourceFormSchema } from "@/lib/validations/frontend";
import { Resend } from "resend";
import { env } from "@/env.mjs";
import { Dictionary, settings } from "../utils";
import { EmailEpisodeResourceTemplate } from "@/components/email/episode-resource-template";

const resend = new Resend(env.RESEND_API_KEY);
export const emailEpisodeResource = async (
  link: string,
  dict: Dictionary,
  formData: FormData,
) => {
  const formSchema = getEmailResourceFormSchema(dict);
  const validatedFields = formSchema.safeParse({
    email: formData.get("email"), // Extract email from FormData
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `no-reply@${settings.domain.prod}`,
      to: validatedFields.data.email,
      subject: "Please find the link to the reading", //TODO localize
      react: await EmailEpisodeResourceTemplate({ link: link }),
    });

    console.log("HERE", data, error);

    if (error) {
      return { errors: error.message };
    }

    return {
      errors: null,
      data,
    };
  } catch (error) {
    console.error("[FrontendAction] Something happened.", error);
    return { errors: error };
  }
};
