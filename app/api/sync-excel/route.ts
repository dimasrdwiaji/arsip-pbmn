import { NextResponse } from "next/server";
import { importExcelToDatabase } from "@/lib/importer";

export async function POST() {
  try {
    const result = importExcelToDatabase();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
