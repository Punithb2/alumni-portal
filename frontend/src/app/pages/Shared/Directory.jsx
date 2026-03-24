import React from 'react'
import useAuth from '../../hooks/useAuth'
import AlumniDirectory from '../Alumni/Directory.jsx'
import StudentDirectory from '../Student/Directory.jsx'

export default function Directory() {
  const { user } = useAuth()

  // If user is Student, show the Student's view (looking for mentors, companies)
  if (user?.role === 'Student') {
    return <StudentDirectory />
  }

  // If user is Alumni, Admin, SA, show the Alumni view (networking with peers)
  return <AlumniDirectory />
}
