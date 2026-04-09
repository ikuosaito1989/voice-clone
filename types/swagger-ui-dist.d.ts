declare module "swagger-ui-dist" {
  export const SwaggerUIBundle: {
    (options: {
      domNode: Element;
      layout?: string;
      presets?: unknown[];
      url: string;
    }): unknown;
    presets: {
      apis: unknown;
    };
  };

  export const SwaggerUIStandalonePreset: unknown;
}
