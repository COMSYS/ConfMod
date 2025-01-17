import { z } from "zod";

export const AppConfigSchema = z.object({
    apiUrl: z.string(),
    availableCategories: z.array(z.string()),
})

export type AppConfig = z.infer<typeof AppConfigSchema>;