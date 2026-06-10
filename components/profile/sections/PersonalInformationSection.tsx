'use client';

import React from 'react';
import { UserProfile } from '../types';
import { Mail, Phone, Globe, MapPin, Calendar, Languages } from 'lucide-react';

interface PersonalInformationSectionProps {
  user: UserProfile;
}

/**
 * PersonalInformationSection Component
 * Displays user's personal information in a grid layout
 * Shows email, phone, region, country, member since, and language
 */

function PersonalInformationSection({
  user,
}: PersonalInformationSectionProps): React.ReactElement {
  const info = [
    {
      label: 'Email',
      value: user.email,
      icon: Mail,
    },
    {
      label: 'Phone Number',
      value: user.phoneNumber || 'Not provided',
      icon: Phone,
    },
    {
      label: 'Region',
      value: user.region || 'Not provided',
      icon: MapPin,
    },
    {
      label: 'Country',
      value: user.country,
      icon: Globe,
    },
    {
      label: 'Member Since',
      value: user.joinDate,
      icon: Calendar,
    },
    {
      label: 'Language',
      value: user.language,
      icon: Languages,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-gray-400">
          Your personal account details and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {info.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.08] transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#CE1126]/20 rounded-lg">
                  <Icon size={16} className="text-[#CE1126]" />
                </div>
                <label className="text-sm font-semibold text-gray-400">
                  {item.label}
                </label>
              </div>
              <p className="text-base text-white font-medium">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PersonalInformationSection;
