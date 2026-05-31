import type { Handler } from "@netlify/functions";
import { LoadKnowledgeBaseReactor } from "../../src/backend/body/reactors/loadKnowledgeBaseReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed();
  }

  const reactor = new LoadKnowledgeBaseReactor();
  return jsonResponse(200, await reactor.process());
});

export const handler = authedHandler;
