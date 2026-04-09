import { z } from "zod";
import { createDocument } from "zod-openapi";

const loginRequestSchema = z
  .object({
    email: z.email(),
    password: z.string(),
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

const sseExampleSchema = z
  .string()
  .meta({ id: "SseDoneEvent" });

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "voice-clone API",
    version: "0.1.0",
    description: "JWT login, test endpoint, and SSE test events.",
  },
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
        summary: "Login and issue JWT",
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
            description: "Login success",
            content: {
              "application/json": {
                schema: loginSuccessSchema,
              },
            },
          },
          "400": {
            description: "Missing email or password",
            content: {
              "application/json": {
                schema: errorResponseSchema,
              },
            },
          },
          "401": {
            description: "Invalid credentials",
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
        summary: "Authenticated test endpoint",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: testResponseSchema,
              },
            },
          },
          "401": {
            description: "Unauthorized",
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
        summary: "Publish SSE done event",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Event published",
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
        summary: "SSE stream for done events",
        responses: {
          "200": {
            description: "Server-sent events stream",
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
  },
});
