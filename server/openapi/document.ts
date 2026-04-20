import { createDocument } from "zod-openapi";
import { authPaths, authTag } from "@/server/openapi/schemas/auth";
import {
  referenceAudioTag,
  voiceClonePaths,
  voiceCloneTag,
} from "@/server/openapi/schemas/voice-clones";

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "voice-clone API",
    version: "0.1.0",
    description: "JWT ログインと音声クローン機能を提供する API。",
  },
  tags: [authTag, referenceAudioTag, voiceCloneTag],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    ...authPaths,
    ...voiceClonePaths,
  },
});
