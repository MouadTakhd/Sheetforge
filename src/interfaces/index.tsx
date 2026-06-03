 interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}


interface UserProfileData {
    id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  status: string
  profilePicture: string | null | undefined
}

interface ProfileFormValues {
  firstName: string
  lastName: string
  email: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
}

interface StatusMessage {
  type: 'success' | 'error' | 'info'
  text: string
}
export type { User, UserProfileData, ProfileFormValues, FormErrors, StatusMessage }