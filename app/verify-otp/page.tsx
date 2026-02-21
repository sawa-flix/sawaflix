'use client'

import React, { useState } from 'react'

const VerifyOtpPage = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const sendOtp = async () => {
    if (!email) return setMessage('Please enter an email.')
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        setMessage('OTP sent successfully. Check your email.')
      } else {
        setMessage(data.error || 'Failed to send OTP.')
      }
    } catch (error) {
      setMessage('Server error. Try again.')
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    if (!otp) return setMessage('Please enter the OTP.')
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('User verified successfully!')
        setOtpSent(false)
        setEmail('')
        setOtp('')
      } else {
        setMessage(data.error || 'Verification failed.')
      }
    } catch (error) {
      setMessage('Server error. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Verify OTP</h2>
      {!otpSent ? (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button onClick={sendOtp} disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </>
      )}
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  )
}

export default VerifyOtpPage