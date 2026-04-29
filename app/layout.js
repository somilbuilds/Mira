import './globals.css'

export const metadata = {
  title: 'Mira — Mind Reflective Agent',
  description: 'AI-powered journaling that remembers your patterns and mentors your growth. Built with RAG, Gemini, and depth.',
  keywords: ['journaling', 'AI', 'mentor', 'RAG', 'self-reflection', 'Gemini'],
  openGraph: {
    title: 'Mira — Mind Reflective Agent',
    description: 'AI-powered journaling that remembers your patterns and mentors your growth.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
