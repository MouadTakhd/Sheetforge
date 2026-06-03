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
import { AlertMatrix, type AlertMessage } from '@/components/ui/AlertMatrix'
import { FormErrors, ProfileFormValues, UserProfileData } from '@/interfaces'
import {
  Camera,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  Sparkles,
  Fingerprint,
  CloudLightning,
  ShieldAlert,
  Sliders
} from 'lucide-react'

const patchHeaders = {
  headers: {
    // for api platform headers 'Content-Type': 'application/merge-patch+json',
    'Content-Type': 'application/json'

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
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<AlertMessage | null>(null)
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
        lastName: response.data.lastName ?? '',
        email: response.data.email ?? '',
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
      lastName: user.lastName ?? '',
      email: user.email ?? '',
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
    setMessage({ type: 'pending', text: 'Syncing profile properties with security directories...' })

    try {
      // FIXED: Discarding read-only email attributes from explicit mutation payloads
      const response = await api.patch<UserProfileData>(
        '/me',
        { 
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim()
        },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data)
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
    setMessage({ type: 'pending', text: 'Streaming binary asset package down to cloud storage S3 cluster...' })

    try {
      const mediaPayload = new FormData()
      mediaPayload.append('file', file)
      const mediaResponse = await api.post('/media_objects', mediaPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const s3Url = mediaResponse.data.contentUrl

      const response = await api.patch<UserProfileData>(
        '/me',
        { profilePicture: s3Url },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data)
      setMessage({ type: 'success', text: 'Cloud object pointer saved. Profile avatar updated successfully!' })
    } catch (error) {
      console.error('Failed to upload profile picture', error)
      setMessage({ type: 'error', text: 'Cloud upload dropped out. Connection timed out.' })
    } finally {
      setIsAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveAvatar() {
    if (!user?.profilePicture) return
    setIsAvatarLoading(true)
    setMessage({ type: 'pending', text: 'De-allocating storage binaries from S3 cluster bucket...' })

    try {
      const response = await api.patch<UserProfileData>(
        '/me',
        { profilePicture: null },
        patchHeaders,
      )
      setUser(response.data)
      setUserStore(response.data)
      setMessage({ type: 'success', text: 'Profile picture pointer removed safely from records.' })
    } catch (error) {
      console.error('Failed to remove profile picture', error)
      setMessage({ type: 'error', text: 'Could not remove profile picture. Pipeline failed.' })
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

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="space-y-6 text-foreground w-full max-w-none animate-in fade-in-50 duration-300 relative pb-12">
      
      {/* ─── SCRAMBLED BLUR REDIRECT MATRICES ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute right-[-10%] top-[-20%] h-[450px] w-[450px] rounded-full bg-linear-to-br from-primary/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute left-[-5%] top-[40%] h-[350px] w-[350px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute right-[20%] bottom-[-10%] h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* ─── TOP SECTION: ASYMMETRIC HEADER SPLIT ─── */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between w-full">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Identity Control Node
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            Account Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Configure system execution parameters, authorize bucket tokens, and edit core identity signatures.
          </p>
        </div>

        {/* Floating Offsets Signout Frame */}
        <div className="w-full md:w-auto self-stretch md:self-auto flex items-end justify-end pt-2">
          <Button 
            variant="outline" 
            onClick={() => logout()} 
            className="w-full md:w-auto h-10 px-5 text-xs font-bold gap-2 rounded-xl border-border/80 shadow-md hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all bg-card/40 backdrop-blur-sm"
          >
            <LogOut className="h-3.5 w-3.5" /> Break Session
          </Button>
        </div>
      </div>

      {/* ─── UNIFIED PIPELINE ALERTS SYSTEM ─── */}
      <AlertMatrix message={message} onClose={() => setMessage(null)} />

      {/* ─── NON-LINEAR STAGGERED SCRAMBLED LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start w-full">
        
        {/* PANEL A: OFFSET DYNAMIC DATA OVERVIEW (FORM CONTAINER MATRIX) */}
        <div className="space-y-6 w-full lg:translate-y-2 order-2 lg:order-1">
          
          <Card className="rounded-3xl border border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative">
            <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary/40 via-purple-500/40 to-transparent" />
            
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-black tracking-tight">Core Account Blueprint</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">Modify variables mapped onto pipeline extraction structures.</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleProfileSubmit} className="m-0 p-0" noValidate>
              <CardContent className="p-6 pt-2 space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Given Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formValues.firstName} 
                      onChange={handleChange} 
                      disabled={isSaving} 
                      className="h-10 rounded-xl bg-background/60 border-border/60 text-xs focus-visible:ring-primary/20" 
                    />
                    {errors.firstName && <p className="text-[11px] font-bold text-red-500 animate-pulse">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Family Surname</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formValues.lastName} 
                      onChange={handleChange} 
                      disabled={isSaving} 
                      className="h-10 rounded-xl bg-background/60 border-border/60 text-xs focus-visible:ring-primary/20" 
                    />
                    {errors.lastName && <p className="text-[11px] font-bold text-red-500 animate-pulse">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="account-email" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Encryption Bound Email Route
                  </Label>
                  <Input 
                    id="account-email" 
                    name="email"
                    value={formValues.email} 
                    readOnly 
                    className="cursor-not-allowed bg-muted/20 text-xs h-10 border-border/30 shadow-none font-medium text-muted-foreground/60 select-all rounded-xl font-mono" 
                  />
                </div>

                {/* Form Buttons Content Dock Inside Form Frame */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4 border-t border-border/10 mt-6 bg-muted/10 -mx-6 -mb-6 p-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleReset} 
                    disabled={!hasPendingChanges || isSaving} 
                    className="w-full sm:w-auto h-9 text-xs font-bold rounded-lg transition-all"
                  >
                    Discard Edits
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isSaving || !hasPendingChanges} 
                    className="w-full sm:w-auto h-9 px-5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                  >
                    {isSaving && <Loader2 className="mr-1.5 h-3 w-3.5 animate-spin" />}
                    Commit Adjustments
                  </Button>
                </div>

              </CardContent>
            </form>
          </Card>

          {/* ASYMMETRIC SECONDARY HUD: INFRASTRUCTURE STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0"><CloudLightning className="h-4 w-4" /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">S3 Binary Pipeline</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Connected directly to automated MinIO proxy nodes.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0"><ShieldAlert className="h-4 w-4" /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Storage Shield</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Isolated runtime matrix configuration limits user footprint.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL B: ELEVATED IDENTITY SHIELD (AVATAR) */}
        <div className="w-full space-y-4 order-1 lg:order-2 lg:-translate-y-4">
          
          <Card className="rounded-[2.5rem] border border-border/60 bg-gradient-to-b from-card/40 to-background/20 backdrop-blur-lg shadow-2xl overflow-hidden group relative">
            <div className="absolute -right-12 -bottom-12 h-32 w-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            
            <CardContent className="p-6 space-y-6 text-center relative z-10">
              
              {/* Profile Box Frame */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-dashed border-primary/30 p-1 bg-background/40 shadow-inner group transition-all duration-300 hover:rotate-2">
                <div className="h-full w-full rounded-2xl overflow-hidden relative bg-muted/60 flex items-center justify-center border border-border/40">
                  {isAvatarLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Avatar" 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-2deg]" 
                    />
                  ) : (
                    <span className="text-base font-black tracking-widest bg-gradient-to-br from-primary to-purple-400 bg-clip-text text-transparent">{initials}</span>
                  )}
                  
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Update</span>
                  </div>
                </div>
              </div>

              {/* Identity Headers */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background border border-border/40 shadow-xs text-[10px] font-black text-foreground">
                  <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="capitalize">{user?.role?.replace('ROLE_', '')?.toLowerCase() ?? 'user'}</span>
                </div>
                <h3 className="text-base font-black tracking-tight pt-1 text-foreground/90">{user?.fullName}</h3>
              </div>

              <Separator className="bg-border/20" />

              {/* SYSTEM STORAGE GAUGES */}
              <div className="space-y-3 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">S3 Account Allocations</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Repository Quota</span>
                    <span className="font-mono text-foreground/90">4.2 MB / 50 MB</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/10 p-px">
                    <div className="h-full w-[12%] bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/20" />

              {/* Technical Tracking Fingerprint Code */}
              <div className="flex items-center justify-between bg-background/60 p-3 rounded-2xl border border-border/40 text-[10px] font-mono font-bold text-muted-foreground w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Fingerprint className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate" title={user?.id}>ID: {user?.id}</span>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarUpload} className="hidden" />
              
              {user?.profilePicture && (
                <button 
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isAvatarLoading}
                  className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-destructive transition-colors flex items-center gap-1 mx-auto pt-1"
                >
                  <Trash2 className="h-3 w-3" /> De-allocate profile file
                </button>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  )
}