import { z } from "zod";
import type { ZodOpenApiPathsObject } from "zod-openapi";

export const errorResponseSchema = z
  .object({
    error: z.string(),
  })
  .meta({ id: "ErrorResponse" });

export const loginRequestSchema = z
  .object({
    email: z.email().default("admin@example.com"),
    password: z.string().default("password"),
  })
  .meta({ id: "LoginRequest" });

export const userSchema = z
  .object({
    id: z.string(),
    email: z.email(),
    displayName: z.string().nullable(),
    role: z.string(),
  })
  .meta({ id: "User" });

export const loginSuccessSchema = z
  .object({
    ok: z.literal(true),
    token: z.string(),
    user: userSchema,
  })
  .meta({ id: "LoginSuccess" });

export const authTag = {
  name: "auth",
  description: "認証関連 API",
};

export const authPaths: ZodOpenApiPathsObject = {
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
};
