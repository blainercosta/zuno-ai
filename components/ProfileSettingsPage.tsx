import { useState } from 'react';

interface ProfileSettingsPageProps {
  onBack: () => void;
}

export default function ProfileSettingsPage({ onBack }: ProfileSettingsPageProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'password' | 'profile' | 'availability' | 'social' | 'preferences' | 'notifications' | 'early-access' | 'api-keys' | 'layers-plus' | 'teams'>('profile');
  const [formData, setFormData] = useState({
    fullName: 'Blainer Costa',
    location: 'London, UK',
    website: 'layers.to',
    bio: '',
    skills: '',
    experienceLevel: 'intermediate'
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    {
      id: 'general' as const,
      label: 'General',
      section: 'User',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'password' as const,
      label: 'Password',
      section: 'User',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      section: 'User',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'availability' as const,
      label: 'Availability',
      section: 'User',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'social' as const,
      label: 'Social',
      section: 'User',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'preferences' as const,
      label: 'Preferences',
      section: 'App',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      section: 'App',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'early-access' as const,
      label: 'Early Access',
      section: 'App',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'api-keys' as const,
      label: 'API Keys',
      section: 'Developer',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'layers-plus' as const,
      label: 'Layers Plus',
      section: 'Subscription',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'teams' as const,
      label: 'Teams',
      section: 'Teams',
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <aside className="w-[267px] border-r border-zinc-800/50 flex flex-col">
        {/* Back Button */}
        <div className="h-[68px] px-6 flex items-center border-b border-zinc-800/50">
          <button
            onClick={onBack}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-zinc-800/50 transition-colors -ml-2"
            aria-label="Go back"
          >
            <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          {['User', 'App', 'Developer', 'Subscription', 'Teams'].map((section) => (
            <div key={section} className="mb-8">
              <div className="px-6 mb-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{section}</h3>
              </div>
              <div className="space-y-1">
                {menuItems
                  .filter(item => item.section === section)
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        w-full px-6 py-2 flex items-center gap-3 text-sm transition-colors
                        ${activeSection === item.id
                          ? 'bg-zinc-800/50 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        }
                      `}
                    >
                      <span className={activeSection === item.id ? 'text-white' : 'text-zinc-500'}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="h-[68px] px-8 flex items-center justify-center border-b border-zinc-800/50">
          <h1 className="text-base font-semibold">Profile</h1>
        </div>

        {/* Content */}
        <div className="max-w-[672px] mx-auto py-10 px-8">
          {/* Banner Section */}
          <div className="mb-10">
            <label className="block text-sm font-medium mb-4 text-white">Banner</label>
            <div className="relative">
              <div className="w-full aspect-[21/9] bg-zinc-900 rounded-2xl border border-zinc-800/50 flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <svg className="size-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="absolute bottom-5 left-5 px-5 py-2 bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-sm font-medium hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Upload
              </label>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="mb-10">
            <label className="block text-sm font-medium mb-4 text-white">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="size-[88px] rounded-full bg-zinc-900 border border-zinc-800/50 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="size-9 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="px-5 py-2 bg-zinc-900 border border-zinc-800/50 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Upload
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-8">
            <label htmlFor="fullName" className="block text-sm font-medium mb-3 text-white">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Location */}
          <div className="mb-8">
            <label htmlFor="location" className="block text-sm font-medium mb-3 text-white">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="London, UK"
              className="w-full px-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Website */}
          <div className="mb-8">
            <label htmlFor="website" className="block text-sm font-medium mb-3 text-white">
              Website
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                https://
              </span>
              <input
                id="website"
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="layers.to"
                className="w-full pl-[72px] pr-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <label htmlFor="bio" className="block text-sm font-medium mb-3 text-white">
              Bio
            </label>
            <div className="relative">
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                maxLength={500}
                rows={5}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none transition-colors"
              />
              <span className="absolute bottom-3 right-4 text-xs text-zinc-600">
                {formData.bio.length}/500
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <label htmlFor="skills" className="block text-sm font-medium mb-3 text-white">
              Skills
            </label>
            <input
              id="skills"
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Experience Level */}
          <div className="mb-12">
            <label htmlFor="experienceLevel" className="block text-sm font-medium mb-3 text-white">
              Experience Level
            </label>
            <div className="relative">
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-4 py-3 bg-[#0c0c0d] border border-zinc-800/50 rounded-xl text-white focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer transition-colors"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-8 border-t border-zinc-800/50">
            <button
              onClick={onBack}
              className="px-6 py-2.5 border border-zinc-800/50 rounded-xl text-sm font-medium hover:bg-zinc-900/50 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
