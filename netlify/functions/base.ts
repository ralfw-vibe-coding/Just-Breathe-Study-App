import type { Handler } from "@netlify/functions";
import { LoadKnowledgeBaseReactor } from "../../src/backend/body/reactors/loadKnowledgeBaseReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed();
  }

  try {
    const reactor = new LoadKnowledgeBaseReactor();
    return jsonResponse(200, await reactor.process());
  } catch (error) {
    return jsonResponse(500, {
      error:
        error instanceof Error
          ? `Knowledge base loading failed: ${error.message}`
          : "Knowledge base loading failed."
    });
  }
});

export const handler = authedHandler;
