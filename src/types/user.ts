export interface AppUser {
  id: number
  cognito_id: string
  email: string
  username: string | null
  first_name: string | null
  last_name: string | null
  role: string | null
  team_id: number | null
}