import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  return NextResponse.json({
    status: "ok",
    storageType: tursoUrl ? "TURSO_CLOUD" : "LOCAL_TMP_SQLITE",
    isUsingTurso: !!tursoUrl,
    hasAuthToken: hasToken,
    urlPrefix: tursoUrl ? tursoUrl.split("@").pop()?.substring(0, 25) : null,
    timestamp: new Date().toISOString(),
  });
}
