import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from 'app/hooks/useAuth'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Link as LinkIcon,
  Phone,
} from 'lucide-react'

// ==========================================
// Reusable Auth Components
// ==========================================

const AuthInput = ({ label, icon: Icon, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          type={inputType}
          className={`block w-full rounded-md border-0 bg-white py-2 text-slate-900 shadow-sm
                               ring-1 ring-inset ring-slate-300 placeholder:text-slate-400
                               focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                               transition-shadow ${Icon ? 'pl-10' : 'pl-3'} pr-3`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  )
}

const RoleSelector = ({ value, onChange }) => {
  const roles = ['Alumni', 'Student', 'University']

  return (
    <div className="flex space-x-3 mt-1">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl border transition-all ${
            value === role
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  )
}

// ==========================================
// Login Page
// ==========================================

export const Login = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('Alumni')
  const [email, setEmail] = useState('alumni@example.com')
  const [password, setPassword] = useState('password123')

  const { login } = useAuth()

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    if (newRole === 'Alumni') {
      setEmail('alumni@example.com')
      setPassword('password123')
    } else if (newRole === 'Student') {
      setEmail('student@example.com')
      setPassword('password123')
    } else if (newRole === 'University') {
      setEmail('admin@example.com')
      setPassword('password123')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Destination will be handled by the context or just navigate to dashboard
      // The context now fetches the user role and we can use it here if needed
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Illustration/Solid Color (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 opacity-90"></div>

        {/* Decorative floating dots/shapes behind text */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')]"></div>

        <div className="relative z-10 max-w-lg px-8 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-xl">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Connect with your
            <br />
            <span className="text-indigo-400">college alumni network</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium opacity-90 leading-relaxed mb-8">
            Join thousands of graduates worldwide to network, find mentorship, and explore career
            opportunities in a private, exclusive community.
          </p>

          {/* Mock social proof / testimonials */}
          <div className="flex -space-x-4 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                className="w-12 h-12 rounded-full border-2 border-slate-900 relative z-10 hover:z-20 transform hover:scale-110 transition-all duration-300 shadow-sm"
                src={`https://i.pravatar.cc/150?u=${i}`}
                alt="Alumni"
              />
            ))}
          </div>
          <p className="text-sm text-indigo-200/80 font-medium">Join 12,000+ registered alumni</p>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Please sign in to your account to continue
            </p>
          </div>

          <div className="bg-white py-8 px-4 sm:px-10 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select your role
                </label>
                <RoleSelector value={role} onChange={handleRoleChange} />
              </div>

              <AuthInput
                label="Email / College ID"
                icon={Mail}
                type="text"
                placeholder={`Enter your ${role.toLowerCase()} email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <AuthInput
                label="Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded transition-colors"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-600 font-medium cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                                               hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                                               focus-visible:outline-sky-600 transition-colors active:scale-[0.98]"
                >
                  Sign in as {role}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Create {role.toLowerCase()} account &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Register Page (Multi-Section Form)
// ==========================================

// eslint-disable-next-line no-unused-vars
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="mb-8 last:mb-0">
    <div className="border-b border-slate-200 pb-5 mb-6 flex items-center gap-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-slate-900/5">
        <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
      </div>
      <h3 className="text-base/7 font-semibold text-slate-900">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">{children}</div>
  </div>
)

export const Register = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('Alumni')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    college: '',
    department: '',
    graduationYear: '',
    company: '',
    jobTitle: '',
    linkedin: '',
    studentId: '',
    staffId: '',
    gender: '',
  })

  const { register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    // Split full name
    const [firstName, ...lastNames] = formData.fullName.trim().split(' ')
    const lastName = lastNames.join(' ') || '-'

    const payload = {
      username: formData.email, // Using email as username
      email: formData.email,
      password: formData.password,
      first_name: firstName,
      last_name: lastName,
      role: role === 'University' ? 'admin' : role.toLowerCase(),
      phone: formData.phone,
      city: formData.city,
      department: formData.department,
      graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
      current_company: formData.company,
      current_position: formData.jobTitle,
      linkedin_url: formData.linkedin,
      student_id:
        role === 'Student' ? formData.studentId : role === 'University' ? formData.staffId : '',
      gender: formData.gender,
      college: formData.college,
    }

    try {
      await register(payload)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      console.error(error)
      alert('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create {role.toLowerCase()} account
          </h2>
          <p className="mt-3 text-base text-slate-500 font-medium">
            {role === 'Alumni'
              ? 'Join our global alumni network. Reconnect and grow your career.'
              : role === 'Student'
                ? 'Join the student community. Connect with alumni and find mentors.'
                : 'Register as a university representative to manage the portal and community.'}
          </p>
        </div>

        {/* Role Toggle for Signup */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl">
            {['Alumni', 'Student', 'University'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 px-6 text-sm font-bold rounded-xl transition-all ${
                  role === r
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r === 'Alumni'
                  ? 'I am an Alumni'
                  : r === 'Student'
                    ? 'I am a Student'
                    : 'I am a University'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Info */}
            <FormSection title="Personal Information" icon={User}>
              <AuthInput
                label="Full Name"
                name="fullName"
                icon={User}
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <AuthInput
                label="Email Address"
                name="email"
                icon={Mail}
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <AuthInput
                label="Phone Number"
                name="phone"
                icon={Phone}
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone || ''}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 bg-white py-2 px-3 text-slate-900 shadow-sm
                                        ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                                        sm:text-sm sm:leading-6 transition-shadow outline-none"
                >
                  <option value="">Select gender...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </FormSection>

            {/* Section 2: Academic Info (Alumni & Student Only) */}
            {role !== 'University' && (
              <FormSection title="Academic Information" icon={GraduationCap}>
                <AuthInput
                  label="College / University"
                  name="college"
                  icon={Building2}
                  placeholder="State University"
                  value={formData.college}
                  onChange={handleChange}
                  required
                />
                <AuthInput
                  label="Department / Major"
                  name="department"
                  icon={GraduationCap}
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                {role === 'Student' ? (
                  <>
                    <AuthInput
                      label="Student ID / Roll No"
                      name="studentId"
                      icon={Building2}
                      placeholder="CS-2024-001"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Current Year
                      </label>
                      <select
                        name="currentYear"
                        value={formData.currentYear}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 bg-white py-2 px-3 text-slate-900 shadow-sm
                                              ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                                              sm:text-sm sm:leading-6 transition-shadow outline-none"
                        required
                      >
                        <option value="">Select year...</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year (if applicable)</option>
                      </select>
                    </div>
                    <AuthInput
                      label="Expected Graduation Year"
                      name="graduationYear"
                      icon={GraduationCap}
                      type="number"
                      placeholder="2027"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      required
                    />
                  </>
                ) : (
                  <>
                    <AuthInput
                      label="Graduation Year (Batch)"
                      name="graduationYear"
                      icon={GraduationCap}
                      type="number"
                      placeholder="2023"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Degree
                      </label>
                      <select
                        name="degree"
                        value={formData.degree || ''}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 bg-white py-2 px-3 text-slate-900 shadow-sm
                                              ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                                              sm:text-sm sm:leading-6 transition-shadow outline-none"
                        required
                      >
                        <option value="">Select degree...</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">Ph.D.</option>
                        <option value="associate">Associate Degree</option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>
                  </>
                )}
              </FormSection>
            )}

            {/* Section 3: Role Specific Info */}
            {role === 'Alumni' ? (
              <FormSection title="Professional Information" icon={Briefcase}>
                <AuthInput
                  label="Current Job Title"
                  name="jobTitle"
                  icon={Briefcase}
                  placeholder="Software Engineer"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                <AuthInput
                  label="Company Name"
                  name="company"
                  icon={Building2}
                  placeholder="TechCorp"
                  value={formData.company}
                  onChange={handleChange}
                />
                <AuthInput
                  label="Industry"
                  name="industry"
                  icon={Briefcase}
                  placeholder="Information Technology"
                  value={formData.industry}
                  onChange={handleChange}
                />
                <AuthInput
                  label="LinkedIn Profile"
                  name="linkedin"
                  icon={LinkIcon}
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <AuthInput
                    label="Current City"
                    name="city"
                    icon={MapPin}
                    placeholder="San Francisco, CA"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>
            ) : role === 'Student' ? (
              <FormSection title="Student Preferences" icon={User}>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Primary Interests
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 bg-white py-2 px-3 text-slate-900 shadow-sm
                                            ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                                            sm:text-sm sm:leading-6 transition-shadow outline-none"
                    required
                  >
                    <option value="">Select primary interest...</option>
                    <option value="mentorship">Looking for Mentorship</option>
                    <option value="internship">Looking for Internships</option>
                    <option value="networking">General Networking</option>
                    <option value="clubs">Joining Clubs & Events</option>
                  </select>
                </div>
              </FormSection>
            ) : (
              <FormSection title="Administrative Details" icon={Briefcase}>
                <AuthInput
                  label="Staff ID / Employee Number"
                  name="staffId"
                  icon={Building2}
                  placeholder="ADM-2024-001"
                  value={formData.staffId}
                  onChange={handleChange}
                  required
                />
                <AuthInput
                  label="Department / Area"
                  name="department"
                  icon={Briefcase}
                  placeholder="Alumni Relations"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Administrative Role
                  </label>
                  <select
                    name="adminRole"
                    value={formData.adminRole}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 bg-white py-2 px-3 text-slate-900 shadow-sm
                                            ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                                            sm:text-sm sm:leading-6 transition-shadow outline-none"
                    required
                  >
                    <option value="">Select admin role...</option>
                    <option value="alumni_coordinator">Alumni Coordinator</option>
                    <option value="event_management">Event Management</option>
                    <option value="student_affairs">Student Affairs</option>
                    <option value="system_admin">System Administrator</option>
                  </select>
                </div>
              </FormSection>
            )}

            {/* Section 4: Account Info */}
            <FormSection title="Account Security" icon={Lock}>
              <AuthInput
                label="Password"
                name="password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <AuthInput
                label="Confirm Password"
                name="confirmPassword"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </FormSection>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-col-reverse sm:flex-row gap-4">
              <div className="text-sm">
                <span className="text-slate-500">Already have an account?</span>{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm
                                           hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                                           focus-visible:outline-sky-600 transition-colors active:scale-[0.98]"
              >
                Submit Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
