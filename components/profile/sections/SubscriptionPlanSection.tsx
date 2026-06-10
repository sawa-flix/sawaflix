'use client';

import React from 'react';
import { SubscriptionPlan } from '../types';
import { Check, CreditCard, Calendar, RefreshCw } from 'lucide-react';

interface SubscriptionPlanSectionProps {
  plan: SubscriptionPlan;
  onManageClick: () => void;
}

/**
 * SubscriptionPlanSection Component
 * Displays current subscription plan with details and features
 */

function SubscriptionPlanSection({
  plan,
  onManageClick,
}: SubscriptionPlanSectionProps): React.ReactElement {
  const statusColors = {
    ACTIVE: 'bg-green-600/10 text-green-400 border-green-600/30',
    CANCELLED: 'bg-red-600/10 text-red-400 border-red-600/30',
    INACTIVE: 'bg-gray-600/10 text-gray-400 border-gray-600/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Subscription Plan</h2>
        <p className="text-gray-400">Manage your subscription and billing</p>
      </div>

      {/* Plan Details */}
      <div className="bg-linear-to-br from-[#CE1126]/20 to-[#8B0A1E]/20 border border-[#CE1126]/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Plan</p>
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          </div>
          <div
            className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
              statusColors[plan.status]
            }`}
          >
            {plan.status}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <p className="text-lg font-bold text-white">
              ${plan.price.toFixed(2)}
              <span className="text-sm text-gray-400">/month</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Start Date</p>
            <p className="text-lg font-bold text-white">{plan.startDate}</p>
          </div>
          {plan.renewalDate && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Renewal Date</p>
              <p className="text-lg font-bold text-white">{plan.renewalDate}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-[#CE1126]" />
            <p className="text-sm text-gray-300">
              {plan.autoRenew ? 'Auto-renewal enabled' : 'Manual renewal'}
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Plan Features</h3>
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-white/10">
        <button
          onClick={onManageClick}
          className="flex-1 px-6 py-3 bg-[#CE1126] rounded-lg text-white font-semibold hover:bg-red-700 transition"
        >
          <CreditCard className="inline mr-2" size={16} />
          Manage Billing
        </button>
      </div>
    </div>
  );
}

export default SubscriptionPlanSection;
