// src/routes/about.tsx
import { useEffect, useRef, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'
import { useAuth } from '@/stores/auth'
import { FormErrors, ProfileFormValues, StatusMessage, UserProfileData} from '@/interfaces'
import {
  Camera,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react'


const patchHeaders = {
  headers: {
    'Content-Type': 'application/merge-patch+json',
  },
}

export const Route = createFileRoute('/about')({
  beforeLoad: () => {
    const token = localStorage.getItem('sheetforge_jwt_token')
    if (!token) {
      throw redirect({ to: '/auth' })
    }
  },
  component: AccountManagementPage,
})

function AccountManagementPage() {
  const logout = useAuth((state) => state.logout)
  const setUserStore = useAuth((state) => state.setUser)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<UserProfileData | null>(null)
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<StatusMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)

  useEffect(() => {
    void fetchProfile()
  }, [])

  const hasPendingChanges = user
    ? formValues.firstName.trim() !== user.firstName || formValues.lastName.trim() !== user.lastName
    : false

  async function fetchProfile() {
    setIsLoading(true)
    try {
      const response = await api.get<UserProfileData>('/me')
      setUser(response.data)
      setFormValues({ 
        firstName: response.data.firstName ?? '',
        lastName: response.data.lastName ?? ''
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to fetch account data', error)
      setMessage({
        type: 'error',
        text: 'Unable to load account details. Please refresh and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors({})
    if (message?.type !== 'success') setMessage(null)
  }

  function handleReset() {
    if (!user) return
    setFormValues({ 
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? ''
    })
    setErrors({})
    setMessage({
      type: 'info',
      text: 'Changes were reset to your current account data.',
    })
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    const localErrors: FormErrors = {}
    if (!formValues.firstName.trim()) localErrors.firstName = 'First name is required.'
    if (!formValues.lastName.trim()) localErrors.lastName = 'Last name is required.'
    
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors)
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await api.patch<UserProfileData>(
        '/me',
        { 
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim()
        },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data) // Update global useAuth state sync instantly
      setMessage({
        type: 'success',
        text: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      console.error('Failed to save profile', error)
      setMessage({
        type: 'error',
        text: 'Could not save your profile changes. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Avatar image must be 4MB or smaller.' })
      return
    }

    setIsAvatarLoading(true)
    setMessage(null)

    try {
      // 1. Post to your S3 storage engine controller pipeline first
      const mediaPayload = new FormData()
      mediaPayload.append('file', file)
      const mediaResponse = await api.post('/media_objects', mediaPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const s3Url = mediaResponse.data.contentUrl

      // 2. Patch the resulting link string down to your profile user entity
      const response = await api.patch<UserProfileData>(
        '/me',
        { profilePicture: s3Url },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data)
      setMessage({ type: 'success', text: 'Profile picture updated successfully.' })
    } catch (error) {
      console.error('Failed to upload profile picture', error)
      setMessage({ type: 'error', text: 'Could not upload profile picture.' })
    } finally {
      setIsAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveAvatar() {
    if (!user?.profilePicture) return
    setIsAvatarLoading(true)
    setMessage(null)

    try {
      const response = await api.patch<UserProfileData>(
        '/me',
        { profilePicture: null },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data)
      setMessage({ type: 'success', text: 'Profile picture removed.' })
    } catch (error) {
      console.error('Failed to remove profile picture', error)
      setMessage({ type: 'error', text: 'Could not remove profile picture.' })
    } finally {
      setIsAvatarLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-foreground w-full max-w-none animate-in fade-in-50 duration-200">
      
      {/* ─── BANNER HEADER ─── */}
      <section className="rounded-2xl border border-border/40 bg-card/40 p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Account Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your credentials and global workspace parameters.
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()} className="w-full sm:w-auto h-9 text-xs font-bold gap-2 shrink-0">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </section>

      {message && (
        <div className={`rounded-xl border px-4 py-2.5 text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
          message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
          message.type === 'error' ? 'border-destructive/20 bg-destructive/5 text-destructive' :
          'border-primary/20 bg-primary/5 text-primary'
        }`}>
          {message.text}
        </div>
      )}

      {/* ─── RESPONSIVE SPLIT WORKSPACE ─── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* AVATAR DOCK SIDEBAR */}
        <Card className="w-full lg:w-[260px] xl:w-70 rounded-2xl border border-border/50 bg-card/30 shrink-0">
          <CardContent className="p-5 space-y-4 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-background shadow-inner">
              {isAvatarLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : user?.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-muted-foreground/60" />
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 w-full">
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isAvatarLoading} className="w-full h-8.5 text-xs font-semibold gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Upload Image
              </Button>
              <Button type="button" variant="outline" onClick={handleRemoveAvatar} disabled={isAvatarLoading || !user?.profilePicture} className="w-full h-8.5 text-xs font-semibold gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarUpload} className="hidden" />
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-0.5 text-left pl-1">
              <p className="font-bold text-xs truncate">{user?.fullName}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">ID: {user?.id?.substring(0, 8)}...</p>
            </div>
          </CardContent>
        </Card>

        {/* INPUT IDENTIFIERS CORE PANEL */}
        <Card className="flex-1 w-full rounded-2xl border border-border/50 bg-card/30">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base font-bold">Profile Information</CardTitle>
            <CardDescription className="text-xs">Update your global profile attributes safely below.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2">
            <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input id="firstName" name="firstName" value={formValues.firstName} onChange={handleChange} disabled={isSaving} className="h-10 bg-background text-xs" />
                  {errors.firstName && <p className="text-[11px] font-bold text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formValues.lastName} onChange={handleChange} disabled={isSaving} className="h-10 bg-background text-xs" />
                  {errors.lastName && <p className="text-[11px] font-bold text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Verified Workspace Email
                </Label>
                <Input id="account-email" value={user?.email ?? ''} readOnly className="cursor-not-allowed bg-muted/30 text-xs h-10 select-all" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Access Clearances
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize text-[10px] font-extrabold px-2 py-0.5 border border-white/5 bg-background">
                    {user?.role?.replace('ROLE_', '')?.toLowerCase() ?? 'user'}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end border-t border-border/10">
                <Button type="button" variant="outline" onClick={handleReset} disabled={!hasPendingChanges || isSaving} className="w-full sm:w-auto h-9 text-xs font-bold">
                  Reset
                </Button>
                <Button type="submit" disabled={isSaving || !hasPendingChanges} className="w-full sm:w-auto h-9 text-xs font-bold bg-primary text-primary-foreground">
                  {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Save Profile Changes
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}