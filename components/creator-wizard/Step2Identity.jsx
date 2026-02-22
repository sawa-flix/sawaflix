import React from 'react';

const inputClass = (hasError) =>
    `w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all font-medium text-sm ${
        hasError
            ? 'bg-red-950/20 border border-red-500/50 focus:ring-red-500/30'
            : 'bg-[#141820] border border-white/5 focus:ring-red-600/20'
    } `;

const FieldError = ({ message }) => message ? (
    <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {message}
    </p>
) : null;

const Step2Identity = ({ data, updateData, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Tell us about yourself</h2>
                <p className="text-gray-500 text-xs">Help us understand your creative identity and passion</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="legalName"
                        value={data.legalName || ''}
                        onChange={handleChange}
                        placeholder="Your legal name"
                        className={inputClass(!!errors.legalName)}
                    />
                    <FieldError message={errors.legalName} />
                </div>

                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Creator Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="creatorName"
                        value={data.creatorName || ''}
                        onChange={handleChange}
                        placeholder="Stage name"
                        className={inputClass(!!errors.creatorName)}
                    />
                    <FieldError message={errors.creatorName} />
                </div>

                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Community / Ethnic Group <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ethnicGroup"
                        value={data.ethnicGroup || ''}
                        onChange={handleChange}
                        placeholder="Ethnic group or community name"
                        className={inputClass(!!errors.ethnicGroup)}
                    />
                    <FieldError message={errors.ethnicGroup} />
                </div>

                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={data.phone || ''}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className={inputClass(!!errors.phone)}
                    />
                    <FieldError message={errors.phone} />
                </div>

                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={data.email || ''}
                        onChange={handleChange}
                        placeholder="Email address"
                        className={inputClass(!!errors.email)}
                    />
                    <FieldError message={errors.email} />
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.15)' }}>
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold text-red-400 text-xs mb-1">Privacy First</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Your data is securely stored and only used for verification purposes.</p>
                </div>
            </div>
        </div>
    );
};

export default Step2Identity;
