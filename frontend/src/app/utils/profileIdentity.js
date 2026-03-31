const pick = (...values) => values.find((value) => typeof value === 'string' && value.trim().length > 0)

export const getProfileFirstName = (profile) =>
  pick(profile?.first_name, profile?.firstName, profile?.user?.first_name, profile?.user?.firstName) ||
  ''

export const getProfileLastName = (profile) =>
  pick(profile?.last_name, profile?.lastName, profile?.user?.last_name, profile?.user?.lastName) || ''

export const getProfileFullName = (profile) => {
  const firstName = getProfileFirstName(profile)
  const lastName = getProfileLastName(profile)
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || 'Unknown User'
}

export const getProfileEmail = (profile) =>
  pick(profile?.email, profile?.user?.email, profile?.userEmail, profile?.contact_email) || ''

export const normalizeProfileIdentity = (profile) => {
  const firstName = getProfileFirstName(profile)
  const lastName = getProfileLastName(profile)
  const email = getProfileEmail(profile)

  return {
    ...profile,
    first_name: firstName,
    last_name: lastName,
    email: email || profile?.email,
  }
}

