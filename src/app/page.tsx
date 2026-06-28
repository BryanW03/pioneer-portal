import { redirect } from 'next/navigation'

// Force dynamic - never statically render this page
export const dynamic = 'force-dynamic'

export default function Home() {
  redirect('/login')
}
