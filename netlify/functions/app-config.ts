import type { Handler } from "@netlify/functions";
import { GetAppConfigReactor } from "../../src/backend/body/reactors/getAppConfigReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed();
  }

  const reactor = new GetAppConfigReactor();
  return jsonResponse(200, await reactor.process());
});

export const handler = authedHandler;
