import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message = "ok", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
