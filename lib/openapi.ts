import { z } from "zod";
import { createDocument } from "zod-openapi";

const loginRequestSchema = z
  .object({
    email: z.email().default("admin@example.com"),
    password: z.string().default("password"),
  })
  .meta({ id: "LoginRequest" });

const userSchema = z
  .object({
    id: z.string(),
    email: z.email(),
    displayName: z.string().nullable(),
    role: z.string(),
  })
  .meta({ id: "User" });

const loginSuccessSchema = z
  .object({
    ok: z.literal(true),
    token: z.string(),
    user: userSchema,
  })
  .meta({ id: "LoginSuccess" });

const errorResponseSchema = z
  .object({
    error: z.string(),
  })
  .meta({ id: "ErrorResponse" });

const testResponseSchema = z
  .object({
    ok: z.literal(true),
  })
  .meta({ id: "TestResponse" });

const testCompleteResponseSchema = z
  .object({
    ok: z.literal(true),
    message: z.string(),
    time: z.string(),
  })
  .meta({ id: "TestCompleteResponse" });

const voiceCloneCompleteResponseSchema = z
  .object({
    ok: z.literal(true),
    id: z.string(),
    clonedAudioPath: z.string(),
    clonedAt: z.iso.datetime(),
  })
  .meta({ id: "VoiceCloneCompleteResponse" });

const voiceCloneSchema = z
  .object({
    id: z.string(),
    referenceAudioPath: z.string(),
    recordedText: z.string(),
    desiredText: z.string(),
  })
  .meta({ id: "VoiceClone" });

const voiceCloneDetailSchema = z
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

const pendingVoiceClonesResponseSchema = z
  .object({
    items: z.array(voiceCloneSchema),
  })
  .meta({ id: "PendingVoiceClonesResponse" });

const sseExampleSchema = z.string().meta({ id: "SseDoneEvent" });

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "voice-clone API",
    version: "0.1.0",
    description: "JWT ログイン、テスト用エンドポイント、SSE テストイベントを提供する API。",
  },
  tags: [
    { name: "auth", description: "認証関連 API" },
    { name: "test", description: "テスト関連 API" },
    { name: "reference_audio", description: "参照音声関連 API" },
    { name: "voice_clone", description: "音声クローン関連 API" },
  ],
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
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
    "/api/auth/login": {
      post: {
        tags: ["auth"],
        summary: "ログインして JWT を発行する",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: loginRequestSchema,
            },
          },
        },
        responses: {
          "200": {
            description: "ログイン成功",
            content: {
              "application/json": {
                schema: loginSuccessSchema,
              },
            },
          },
          "400": {
            description: "メールアドレスまたはパスワードが不足",
            content: {
              "application/json": {
                schema: errorResponseSchema,
              },
            },
          },
          "401": {
            description: "認証情報が不正",
            content: {
              "application/json": {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
    "/api/test": {
      get: {
        tags: ["test"],
        summary: "認証付きのテスト用エンドポイント",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: testResponseSchema,
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
    "/api/test/complete": {
      post: {
        tags: ["test"],
        summary: "Durable Object 経由で完了イベントを配信する",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "イベント配信成功",
            content: {
              "application/json": {
                schema: testCompleteResponseSchema,
              },
            },
          },
        },
      },
    },
    "/api/test/events": {
      get: {
        tags: ["test"],
        summary: "Durable Object を利用した SSE ストリーム",
        responses: {
          "200": {
            description: "Server-Sent Events ストリーム",
            content: {
              "text/event-stream": {
                schema: sseExampleSchema,
                example:
                  'event: done\\ndata: {"message":"21:00:00にAPIが叩かれました","time":"21:00:00"}\\n\\n',
              },
            },
          },
        },
      },
    },
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
                required: ["file", "turnstileToken", "recordedText", "desiredText"],
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
            description: "ファイル、Turnstile トークン、録音文章、生成したい文章が不足、またはファイル形式が不正",
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
    "/api/voice-clone/{id}": {
      get: {
        tags: ["voice_clone"],
        summary: "指定した ID の音声クローン情報を取得する",
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
  },
});
