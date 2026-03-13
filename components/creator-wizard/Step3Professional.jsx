import React from 'react';

const inputClass = (hasError) =>
    `w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all font-medium text-sm ${
        hasError
            ? 'bg-red-950/20 border border-red-500/50 focus:ring-red-500/30'
            : 'bg-[#141820] border border-white/5 focus:ring-red-600/20'
    }`;

const FieldError = ({ message }) => message ? (
    <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {message}
    </p>
) : null;

const Step3Professional = ({ data, updateData, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Your Expertise</h2>
                <p className="text-gray-500 text-xs">Tell us about your professional background and cultural journey</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Languages <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="languages"
                        value={data.languages || ''}
                        onChange={handleChange}
                        placeholder="e.g. Assiko, French"
                        className={inputClass(!!errors.languages)}
                    />
                    <FieldError message={errors.languages} />
                </div>

                <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="experienceTime"
                        value={data.experienceTime || ''}
                        onChange={handleChange}
                        placeholder="e.g. 5+ years"
                        className={inputClass(!!errors.experienceTime)}
                    />
                    <FieldError message={errors.experienceTime} />
                </div>

                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                        Your Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="bio"
                        value={data.bio || ''}
                        onChange={handleChange}
                        placeholder="Tell us about your cultural journey and artifacts..."
                        rows={4}
                        className={`${inputClass(!!errors.bio)} resize-none`}
                    />
                    <FieldError message={errors.bio} />
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.15)' }}>
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold text-red-400 text-xs mb-1">Verified Creator Benefits</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Get verified badge, priority support, and enhanced discovery for your authentic content.</p>
                </div>
            </div>
        </div>
    );
};

export default Step3Professional;
