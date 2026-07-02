// shared/utils/api.ts

import { NextResponse } from 'next/server';

/** Wraps a successful API payload in standard NextResponse envelope */
export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/** Standardizes error format payload */
export function apiError(message: string, status: number = 500, code?: string) {
  return NextResponse.json(
    { 
      error: message, 
      code: code || 'API_ERROR',
      success: false 
    }, 
    { status }
  );
}

/** Standardized catch block error parsing for Route Handlers */
export function handleApiCatch(error: unknown) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('[API Exception]:', error);
  return apiError(message, 500, 'UNEXPECTED_EXCEPTION');
}
