import { createJsonErrorResponseHandler } from "@ai-sdk/provider-utils";
import { z } from "zod";

const togetherErrorDataSchema = z.object({
  object: z.literal("error"),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string().nullable(),
});

export type TogetherErrorData = z.infer<typeof togetherErrorDataSchema>;

export const togetherFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: togetherErrorDataSchema,
  errorToMessage: (data) => data.message,
});
