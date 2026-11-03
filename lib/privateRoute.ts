import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export type AuthedSession = Session & {
  user: {
    id: string;
  };
};

export type AuthedRequest = Request & {
  auth: AuthedSession;
};

export type RouteContext<TParams = Record<string, string>> = {
  params: Promise<TParams>;
};

type PrivateHandler<TParams> = (
  req: AuthedRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

export function privateRoute<TParams = Record<string, string>>(
  handler: PrivateHandler<TParams>
) {
  return auth(async (req, context) => {
    const session = req.auth;

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return handler(req as AuthedRequest, context as RouteContext<TParams>);
  });
}
