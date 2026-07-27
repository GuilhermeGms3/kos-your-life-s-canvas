import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_CALIBRE_URL = "http://127.0.0.1:8083";

function getSafeUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Calibre-Web must use HTTP or HTTPS.");
  }
  return url;
}

export const Route = createFileRoute("/api/integrations/calibre/status")({
  server: {
    handlers: {
      GET: async () => {
        const configuredUrl = process.env.CALIBRE_WEB_URL ?? DEFAULT_CALIBRE_URL;
        let publicUrl = DEFAULT_CALIBRE_URL;

        try {
          publicUrl = getSafeUrl(process.env.CALIBRE_WEB_PUBLIC_URL ?? configuredUrl).toString();
        } catch {
          // Keep the local fallback so a bad public URL never breaks the status route.
        }

        try {
          const target = getSafeUrl(configuredUrl);
          const username = process.env.CALIBRE_WEB_USERNAME;
          const password = process.env.CALIBRE_WEB_PASSWORD;
          const headers = new Headers({ Accept: "text/html,application/atom+xml" });

          if (username && password) {
            headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
          }

          const response = await fetch(target, {
            headers,
            redirect: "follow",
            signal: AbortSignal.timeout(3000),
          });

          return Response.json({
            service: "calibre-web",
            online: response.ok,
            status: response.status,
            url: publicUrl,
            opdsUrl: new URL("/opds", publicUrl).toString(),
          });
        } catch (error) {
          return Response.json({
            service: "calibre-web",
            online: false,
            status: null,
            url: publicUrl,
            opdsUrl: new URL("/opds", publicUrl).toString(),
            message: error instanceof Error ? error.message : "Calibre-Web is unavailable.",
          });
        }
      },
    },
  },
});
