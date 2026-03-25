import React, { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  Mail,
  Droplet,
  X,
  MoreHorizontal,
  BadgeCheck,
  UserPlus,
  UserCheck,
  MessageSquare,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from 'lucide-react'
import { getAvatarDataUrl } from '../../utils/avatar'

const ChatProfileSheet = ({ profile, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Posts')

  useEffect(() => {
    setTimeout(() => {
      setActiveTab('Posts')
    }, 0)
  }, [profile])

  if (!profile) return null

  const tabs = ['Posts', 'About', 'Education', 'Experience']

  const handleMessageClick = () => {
    // If they are in the chat already, they are connected.
    // Just close the profile info sheet to display the chat view natively.
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Container */}
      <div
        className={`
          absolute lg:relative right-0 top-0 bottom-0 h-full flex flex-col bg-white z-50 lg:z-auto
          transition-all duration-300 ease-in-out shrink-0 overflow-hidden
          ${
            isOpen
              ? 'w-full sm:w-[350px] lg:w-[320px] xl:w-[380px] border-l border-slate-200 shadow-2xl lg:shadow-none translate-x-0 opacity-100'
              : 'w-full sm:w-[350px] lg:w-0 border-l-0 border-transparent shadow-none translate-x-full lg:translate-x-0 opacity-0 pointer-events-none'
          }
        `}
      >
        <div className="w-full sm:w-[350px] lg:w-[320px] xl:w-[380px] h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            <h3 className="font-semibold text-slate-800">Profile Info</h3>
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close profile"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar bg-slate-50/50">
            {/* Cover Image */}
            <div className="h-32 sm:h-40 w-full bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070&auto=format&fit=crop"
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Profile Info Section */}
            <div className="px-5 sm:px-6 pb-6 relative bg-white">
              <div className="relative -mt-12 sm:-mt-16 mb-4 flex justify-between items-end">
                <div className="p-1 bg-white rounded-full inline-block shadow-md relative z-10">
                  <img
                    src={profile.avatar || getAvatarDataUrl(profile.name)}
                    alt={profile.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white"
                  />
                  {profile.status === 'online' && (
                    <div
                      className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-[3px] border-white rounded-full"
                      title="Online"
                    ></div>
                  )}
                </div>

                <div className="flex items-center gap-2 pb-1 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 text-slate-700 font-semibold text-[13px] sm:text-[14px] rounded-full border border-slate-200 cursor-default">
                    <UserCheck size={16} className="text-emerald-500" />
                    <span className="hidden sm:inline">Connected</span>
                  </div>
                  <button
                    onClick={handleMessageClick}
                    className="flex items-center justify-center p-1.5 sm:p-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  {profile.name}
                  <BadgeCheck size={18} className="text-indigo-500 flex-shrink-0" />
                </h2>
                <p className="text-[14px] sm:text-[15px] font-medium text-slate-500 mt-0.5">
                  {profile.role || 'Web Designer'} {profile.company && `at ${profile.company}`}
                </p>

                <p className="text-[14px] sm:text-[15px] text-slate-700 mt-3 leading-relaxed">
                  {profile.about || "Life is what happens when you're busy making other plans."}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Class of {profile.graduationYear || '2022'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                    {profile.major || 'Design'}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-y-3 gap-x-2 text-[13px] sm:text-[14px] text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate">Joined September 2022</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate">{profile.location || 'Sylhet, Zindabazar'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate">
                    {profile.email || `${profile.name.split(' ')[0].toLowerCase()}@gmail.com`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate">O Positive</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 hide-scrollbar overflow-x-auto mt-2">
                <div className="flex justify-between w-full min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-2 text-[14px] sm:text-[15px] font-semibold transition-colors whitespace-nowrap border-b-2 flex-1 text-center outline-none ${
                        activeTab === tab
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6 mb-8 min-h-[250px]">
                {activeTab === 'Posts' && (
                  <div className="flex flex-col gap-4">
                    {/* Post 1 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.avatar || getAvatarDataUrl(profile.name)}
                            alt=""
                            className="w-10 h-10 rounded-full border border-slate-100"
                          />
                          <div>
                            <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-none">
                              {profile.name}
                            </p>
                            <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                              2 days ago
                            </p>
                          </div>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <p className="text-[14px] sm:text-[15px] text-slate-700 leading-relaxed mb-4 text-left">
                        Sense child do state to defer mr of forty. Become latter but nor abroad
                        wisdom waited. Was delivered gentleman acuteness but daughters. In as of
                        whole as match asked.
                      </p>
                      <div className="w-full h-48 sm:h-52 bg-slate-100 rounded-xl overflow-hidden shadow-inner mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                          alt="Post architecture"
                        />
                      </div>
                      {/* Interactions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                        <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors group">
                          <Heart size={18} className="group-hover:fill-rose-100" />
                          <span className="text-[13px] font-medium">24</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group">
                          <MessageCircle size={18} className="group-hover:fill-blue-50" />
                          <span className="text-[13px] font-medium">5</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                          <Share2 size={18} />
                          <span className="text-[13px] font-medium">Share</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-amber-500 transition-colors group">
                          <Bookmark size={18} className="group-hover:fill-amber-100" />
                        </button>
                      </div>
                    </div>

                    {/* Post 2 */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.avatar || getAvatarDataUrl(profile.name)}
                            alt=""
                            className="w-10 h-10 rounded-full border border-slate-100"
                          />
                          <div>
                            <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-none">
                              {profile.name}
                            </p>
                            <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                              1 week ago
                            </p>
                          </div>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <p className="text-[14px] sm:text-[15px] text-slate-700 leading-relaxed mb-4 text-left">
                        Just finished a great project using React and Tailwind CSS. The developer
                        experience is absolutely unmatched. Anyone else enjoying this stack?
                      </p>
                      {/* Interactions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                        <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors group">
                          <Heart size={18} className="group-hover:fill-rose-100" />
                          <span className="text-[13px] font-medium">112</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group">
                          <MessageCircle size={18} className="group-hover:fill-blue-50" />
                          <span className="text-[13px] font-medium">14</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                          <Share2 size={18} />
                          <span className="text-[13px] font-medium">Share</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-amber-500 transition-colors group">
                          <Bookmark size={18} className="group-hover:fill-amber-100" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'About' && (
                  <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm">
                    <p className="font-bold text-slate-900 mb-2">
                      About {profile.name.split(' ')[0]}
                    </p>
                    <p className="leading-relaxed">
                      {profile.about ||
                        'No additional details provided. User prefers to keep their bio short and sweet.'}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-200/60">
                      <p className="font-bold text-slate-900 mb-3.5">Skills & Expertise</p>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2.5">
                          {profile.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-default shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          {['React', 'Design', 'Management'].map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-default shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'Education' && (
                  <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm">
                    <p className="font-bold text-slate-900 mb-5">Education History</p>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold shrink-0 text-xl border border-indigo-100 shadow-sm">
                        U
                      </div>
                      <div className="pt-0.5">
                        <p className="font-bold text-slate-900 leading-tight">
                          University of Example
                        </p>
                        <p className="text-slate-600 mt-1 font-medium">
                          {profile.major || 'Computer Science'}
                        </p>
                        <p className="text-slate-500 text-[12px] sm:text-[13px] mt-1 bg-white px-2 py-0.5 inline-block rounded-md border border-slate-100">
                          Class of {profile.graduationYear || '2020'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'Experience' && (
                  <div className="text-[14px] sm:text-[15px] text-slate-600 bg-slate-50/80 p-5 rounded-xl border border-slate-100/60 shadow-sm relative overflow-hidden">
                    <p className="font-bold text-slate-900 mb-6">Work Experience</p>
                    {/* Timeline line */}
                    <div className="absolute left-[25px] top-[74px] bottom-8 w-[2px] bg-slate-200"></div>

                    <div className="flex gap-5 relative z-10 mb-8">
                      <div className="mt-1.5 w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0 ring-4 ring-indigo-100" />
                      <div className="-mt-0.5">
                        <p className="font-bold text-slate-900 text-[15px] sm:text-[16px]">
                          {profile.role || 'Research Scientist'}
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[14px] sm:text-[15px]">
                          {profile.company || 'DeepMind'}
                        </p>
                        <p className="text-slate-500 text-[12px] sm:text-[13px] mt-2 font-medium bg-white border border-slate-100 inline-block px-2.5 py-1 rounded-md shadow-sm">
                          Jan 2022 - Present
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5 relative z-10">
                      <div className="mt-1.5 w-3 h-3 bg-slate-300 rounded-full flex-shrink-0 ring-4 ring-slate-100" />
                      <div className="-mt-0.5">
                        <p className="font-bold text-slate-900 text-[15px] sm:text-[16px]">
                          Previous Role
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[14px] sm:text-[15px]">
                          Other Enterprise
                        </p>
                        <p className="text-slate-500 text-[12px] sm:text-[13px] mt-2 font-medium bg-white border border-slate-100 inline-block px-2.5 py-1 rounded-md shadow-sm">
                          Aug 2019 - Dec 2021
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatProfileSheet
