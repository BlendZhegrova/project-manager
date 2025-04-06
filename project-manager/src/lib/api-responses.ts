// src/lib/api-responses.ts
import { NextResponse } from 'next/server'

export const ApiResponse = {
  // Success Responses
  success: (data: any, status = 200) => NextResponse.json(data, { status }),
  created: (data: any) => NextResponse.json(data, { status: 201 }),

  // Error Responses
  unauthorized: () => 
    NextResponse.json(
      { error: 'Unauthorized - please log in' }, 
      { status: 401 }
    ),
  
  notFound: (entity: string) => 
    NextResponse.json(
      { error: `${entity} not found` }, 
      { status: 404 }
    ),
  
  badRequest: (message: string) => 
    NextResponse.json(
      { error: message }, 
      { status: 400 }
    ),
  
  invalidStatus: (validStatuses: string[]) =>
    NextResponse.json(
      { error: `Status must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    ),
  
  serverError: (error?: unknown) => {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  },
  conflict: (message: string) => 
    NextResponse.json(
      { error: message },
      { status: 409 }
    ),
  validationError: (errors: Record<string, string>) =>
    NextResponse.json(
      { error: 'Validation failed', details: errors },
      { status: 422 }
    )
}