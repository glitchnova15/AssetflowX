import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.https://supabase.com/dashboard/project/xrzojlklfvathkhhdhoa/

const supabaseAnonKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyem9qbGtsZnZhdGhraGhkaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDAzNzEsImV4cCI6MjA5OTM3NjM3MX0.Q8r37B_uMDw9NMaSw8QzdZmwTq88PFTPtFZyI-Ir_tI

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
