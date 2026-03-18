
import { z } from "zod";

// This is the schema that will be used by the email flow
export const EmailFlowInputSchema = z.object({
  recipientName: z.string(),
  amount: z.number(),
  iban: z.string(),
  description: z.string(),
  date: z.string(),
  transferType: z.enum(["standard", "instant"]),
  fee: z.number(),
  totalAmount: z.number(),
});
export type EmailFlowInput = z.infer<typeof EmailFlowInputSchema>;
