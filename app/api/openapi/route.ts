import { openApiDocument } from "@/server/openapi/document";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return Response.json({
    ...openApiDocument,
    servers: [
      {
        url: origin,
      },
    ],
  });
}
