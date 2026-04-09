"use client";

import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist";

export function SwaggerUi() {
  return (
    <div
      className="swagger-ui"
      ref={(node) => {
        if (!node || node.dataset.initialized === "true") {
          return;
        }

        SwaggerUIBundle({
          domNode: node,
          layout: "StandaloneLayout",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          url: "/api/openapi",
        });

        node.dataset.initialized = "true";
      }}
    />
  );
}
