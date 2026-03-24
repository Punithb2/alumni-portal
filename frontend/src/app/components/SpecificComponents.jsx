import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Calendar, Users, ChevronRight, GraduationCap } from 'lucide-react'
import { Card, AvatarWithStatus, Badge, Tag } from './GenericComponents'

export const ProfileCard = ({ profile, onClick }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group h-full flex flex-col border-slate-200 bg-white ring-1 ring-slate-200 hover:ring-sky-600/30">
      <Link to={`/profiles/${profile.id}`} onClick={onClick} className="absolute inset-0 z-10">
        <span className="sr-only">View profile of {profile.name}</span>
      </Link>

      {/* Header / Cover */}
      <div className="h-20 bg-slate-50 relative border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
        {profile.isMentor && (
          <div className="absolute top-3 right-3 z-20">
            <Badge
              color="sky"
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-sm ring-1 ring-sky-700/10"
            >
              Mentor
            </Badge>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 flex flex-col flex-1 relative">
        {/* Avatar */}
        <div className="relative -mt-10 mb-3 z-20">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-sm ring-1 ring-slate-200/50"
          />
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight truncate">
            {profile.name}
          </h3>
          <p className="text-xs font-bold text-sky-600 mt-1 uppercase tracking-wider">
            {profile.role}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{profile.company}</p>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center text-xs font-medium text-slate-600">
            <GraduationCap size={14} className="mr-2 text-slate-400 shrink-0" />
            <span className="truncate">
              Class of {profile.graduationYear} &bull; {profile.major}
            </span>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-600">
            <MapPin size={14} className="mr-2 text-slate-400 shrink-0" />
            <span className="truncate">{profile.location}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-5 pt-4 border-t border-slate-50 flex flex-wrap gap-1.5 leading-none">
          {profile.skills?.slice(0, 3).map((skill, i) => (
            <Tag
              key={i}
              className="text-[10px] py-1 px-2 bg-slate-50 text-slate-500 border border-slate-100 font-bold rounded uppercase tracking-tighter"
            >
              {skill}
            </Tag>
          ))}
          {profile.skills?.length > 3 && (
            <Tag className="text-[10px] py-1 px-2 bg-slate-50 text-slate-500 border border-slate-100 font-bold rounded uppercase tracking-tighter">
              +{profile.skills.length - 3}
            </Tag>
          )}
        </div>
      </div>
    </Card>
  )
}
