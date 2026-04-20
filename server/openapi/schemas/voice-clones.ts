import { z } from "zod";
import type { ZodOpenApiPathsObject } from "zod-openapi";
import { errorResponseSchema } from "@/server/openapi/schemas/auth";

export const voiceCloneCompleteResponseSchema = z
  .object({
    ok: z.literal(true),
    id: z.string(),
    clonedAudioPath: z.string(),
    clonedAt: z.iso.datetime(),
  })
  .meta({ id: "VoiceCloneCompleteResponse" });

export const voiceCloneCompletedEventSchema = z.string().meta({
  id: "VoiceCloneCompletedEvent",
});

export const voiceCloneSchema = z
  .object({
    id: z.string(),
    referenceAudioPath: z.string(),
    recordedText: z.string(),
    desiredText: z.string(),
  })
  .meta({ id: "VoiceClone" });

export const voiceCloneDetailSchema = z
  .object({
    id: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    isCloned: z.boolean(),
    clonedAt: z.iso.datetime().nullable(),
    referenceAudioPath: z.string(),
    clonedAudioPath: z.string().nullable(),
    recordedText: z.string(),
    desiredText: z.string(),
  })
  .meta({ id: "VoiceCloneDetail" });

export const pendingVoiceClonesResponseSchema = z
  .object({
    items: z.array(voiceCloneSchema),
  })
  .meta({ id: "PendingVoiceClonesResponse" });

export const referenceAudioTag = {
  name: "reference_audio",
  description: "参照音声関連 API",
};

export const voiceCloneTag = {
  name: "voice_clone",
  description: "音声クローン関連 API",
};

export const voiceClonePaths: ZodOpenApiPathsObject = {
  "/api/reference_audio": {
    post: {
      tags: ["reference_audio"],
      summary: "参照音声をアップロードして音声クローンを作成する",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "file",
                "turnstileToken",
                "recordedText",
                "desiredText",
              ],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "アップロードする WAV 形式の参照音声ファイル",
                },
                turnstileToken: {
                  type: "string",
                  description: "Cloudflare Turnstile の検証トークン",
                },
                recordedText: {
                  type: "string",
                  description: "録音時に読み上げた文章",
                },
                desiredText: {
                  type: "string",
                  description: "生成したい音声の文章",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "参照音声のアップロードと音声クローン作成に成功",
          content: {
            "application/json": {
              schema: voiceCloneSchema,
            },
          },
        },
        "400": {
          description:
            "ファイル、Turnstile トークン、録音文章、生成したい文章が不足、またはファイル形式が不正",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "403": {
          description: "Turnstile 検証に失敗",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "413": {
          description: "ファイルサイズが大きすぎる",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/reference_audio/{id}/file": {
    post: {
      tags: ["reference_audio"],
      summary: "音声クローン ID に対応する参照音声ファイルを取得する",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "参照音声ファイル",
          content: {
            "audio/wav": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        "400": {
          description: "ID が不足",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "404": {
          description: "音声クローンまたはファイルが見つからない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "401": {
          description: "認証されていない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/voice_clones/{id}": {
    get: {
      tags: ["voice_clone"],
      summary: "指定した ID の音声クローン情報を取得する",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "音声クローン情報",
          content: {
            "application/json": {
              schema: voiceCloneDetailSchema,
            },
          },
        },
        "400": {
          description: "ID が不足",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "401": {
          description: "認証されていない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "404": {
          description: "音声クローンが見つからない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/voice_clones/{id}/file": {
    get: {
      tags: ["voice_clone"],
      summary: "指定した ID のクローン済み音声ファイルをダウンロードする",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "クローン済み音声ファイル",
          content: {
            "audio/wav": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
        "400": {
          description: "ID が不足",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "404": {
          description:
            "音声クローンまたはクローン済み音声ファイルが見つからない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/voice_clones/pending": {
    get: {
      tags: ["voice_clone"],
      summary: "未クローンの音声クローン一覧を取得する",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "未クローンの音声クローン一覧",
          content: {
            "application/json": {
              schema: pendingVoiceClonesResponseSchema,
            },
          },
        },
        "401": {
          description: "認証されていない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/voice_clones/{id}/complete": {
    post: {
      tags: ["voice_clone"],
      summary: "クローン済み音声をアップロードして完了状態にする",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "クローン済み音声のアップロードと完了処理に成功",
          content: {
            "application/json": {
              schema: voiceCloneCompleteResponseSchema,
            },
          },
        },
        "400": {
          description: "ID またはファイルが不足",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "401": {
          description: "認証されていない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "404": {
          description: "音声クローンが見つからない",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        "413": {
          description: "ファイルサイズが大きすぎる",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
  "/api/voice_clones/{id}/events": {
    get: {
      tags: ["voice_clone"],
      summary: "指定した ID の完了イベントを SSE で購読する",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "完了イベントの Server-Sent Events ストリーム",
          content: {
            "text/event-stream": {
              schema: voiceCloneCompletedEventSchema,
              example:
                'event: completed\\ndata: {"id":"voice-clone-1","clonedAt":"2026-04-19T12:34:56.000Z"}\\n\\n',
            },
          },
        },
        "400": {
          description: "ID が不足",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
};
