'use client';

import React, { useState } from 'react';
import { SecuritySettings } from '../types';
import { Lock, Smartphone, LogOut, AlertCircle } from 'lucide-react';

interface SecuritySectionProps {
  settings: SecuritySettings;
  onManageClick: () => void;
}

/**
 * SecuritySection Component
 * Displays security settings, active sessions, and security recommendations
 */

function SecuritySection({
  settings,
  onManageClick,
}: SecuritySectionProps): React.ReactElement {
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Security & Privacy</h2>
        <p className="text-gray-400">Manage your account security and active sessions</p>
      </div>

      {/* Security Tips */}
      <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg flex gap-3">
        <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-400 mb-2">Security Tips</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Enable two-factor authentication</li>
            <li>• Review active sessions regularly</li>
            <li>• Don't share your password with others</li>
            <li>• Log out from unused devices</li>
          </ul>
        </div>
      </div>

      {/* Password */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">Password</p>
          <p className="text-sm text-gray-300">
            Last changed: {settings.passwordLastChanged}
          </p>
        </div>
        <button
          onClick={onManageClick}
          className="px-4 py-2 bg-[#CE1126] hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
        >
          <Lock size={16} className="inline mr-2" />
          Change
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Two-Factor Authentication</p>
            <p
              className={`text-sm ${
                settings.twoFactorEnabled
                  ? 'text-green-400'
                  : 'text-yellow-400'
              }`}
            >
              {settings.twoFactorEnabled ? '✓ Enabled' : '○ Disabled'}
            </p>
          </div>
          <button
            onClick={() => setShow2FAPrompt(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition"
          >
            {settings.twoFactorEnabled ? 'Manage' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {settings.activeSessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border rounded-lg flex items-start justify-between ${
                session.isCurrent
                  ? 'bg-green-600/10 border-green-600/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Smartphone size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    {session.device}
                    {session.isCurrent && (
                      <span className="text-xs text-green-400 ml-2">(Current)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last active: {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs font-semibold transition">
                  <LogOut size={14} className="inline mr-1" />
                  Sign Out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">Last login: {settings.lastLogin}</p>
    </div>
  );
}

export default SecuritySection;
