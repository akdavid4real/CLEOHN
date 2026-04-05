'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupKey, setSetupKey] = useState('')
  const [email, setEmail] = useState('admin@cleohn.com')
  const [password, setPassword] = useState('Admin123!')
  const [result, setResult] = useState<any>(null)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setupKey, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success('Admin user created successfully!')
      } else {
        toast.error(data.error || 'Setup failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initial Setup</CardTitle>
          <CardDescription>Create the admin user for your CLEOHN installation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setupKey">Setup Key</Label>
              <Input
                id="setupKey"
                type="text"
                placeholder="cleohn-setup-2026"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default: cleohn-setup-2026
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Admin User'}
            </Button>
          </form>

          {result && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                ✅ {result.message}
              </p>
              <div className="text-xs space-y-1">
                <p><strong>Email:</strong> {result.email}</p>
                {result.password && <p><strong>Password:</strong> {result.password}</p>}
              </div>
              <Button
                className="w-full mt-3"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
