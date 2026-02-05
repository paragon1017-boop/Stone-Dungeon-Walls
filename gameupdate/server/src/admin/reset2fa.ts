import { Express, Request, Response, NextFunction } from 'express'

// Simple in-memory store for demo/demo-safe admin resets
// In production, replace with proper persistent storage and audit logs
const pendingEnrollments: Map<string, string> = new Map()

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] || req.headers['authorization']
  if (typeof token === 'string' && token === 'admin-secret') {
    next()
  } else {
    res.status(403).json({ error: 'Forbidden: admin authentication required' })
  }
}

export async function registerAdminRoutes(app: Express) {
  const router = require('express').Router()

  // Endpoint: reset a user's 2FA enrollment (admin only)
  router.post('/admin/users/:id/reset-2fa', adminAuth, (req: Request, res: Response) => {
    const userId = req.params.id
    // In a real app, validate user exists and is allowed to reset
    const enrollmentToken = Math.random().toString(36).slice(2) // pseudo token for enrollment flow
    pendingEnrollments.set(userId, enrollmentToken)

    // Log for auditing (here we just respond and store in memory)
    console.log(`[ADMIN 2FA RESET] admin reset requested for user ${userId}`)

    res.json({ ok: true, userId, enrollmentToken, message: '2FA enrollment reset initiated. User should re-enroll their authenticator.' })
  })

  app.use('/', router)
}
