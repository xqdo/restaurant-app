import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message: message || 'Success',
      data,
    },
    { status }
  )
}

export function errorResponse(message: string, status = 500, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  )
}
