import { useState } from 'react'

// ===============================
// HELPERS
// ===============================
const fmtAUD = (n) => `$${Number(n || 0).toFixed(2)}`

// ===============================
// GENERIC PLACEHOLDER PAGE
// ===============================
function SimplePage({ title }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>{title}</h2>
      <p>This section is under construction.</p>
    </div>
  )
}

// ===============================
// STANDBY / M&D FORM
// ===============================
function StandbyForm({ claimType }) {
  const [form, setForm] = useState({
    distKm: '',
    notes: '',
    shift: 'Day',
  })

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const km = Number(form.distKm || 0)
  const travel = km * 0.88
  const nightMealie = form.shift === 'Night' ? 15 : 0
  const estTotal = travel + nightMealie

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{claimType === 'M&D' ? 'Muster & Dismiss' : 'Standby'}</h2>

      <div className="field">
        <label>Shift</label>
        <select value={form.shift} onChange={set('shift')}>
          <option value="Day">Day</option>
          <option value="Night">Night</option>
        </select>
      </div>

      <div className="field">
        <label>Distance (km, one way)</label>
        <input
          type="number"
          value={form.distKm}
          onChange={set('distKm')}
          min="0"
        />
      </div>

      <div className="field">
        <label>Notes</label>
        <input
          type="text"
          value={form.notes}
          onChange={set('notes')}
        />
      </div>

      {(km > 0 || form.shift === 'Night') && (
        <div className="info-box">
          Est. travel: {fmtAUD(travel)}
          {nightMealie > 0 && ` + night mealie: ${fmtAUD(nightMealie)}`}
          {' = '}
          <strong>{fmtAUD(estTotal)}</strong>
        </div>
      )}
    </div>
  )
}

// ===============================
// EXPORTS (THIS FIXES YOUR ERROR)
// ===============================

export function RecallsPage() {
  return <SimplePage title="Recalls" />
}

export function RetainPage() {
  return <SimplePage title="Retain" />
}

export function StandbyPage() {
  return <StandbyForm claimType="Standby" />
}

export function MandPage() {
  return <StandbyForm claimType="M&D" />
}

export function SpoiltPage() {
  return <SimplePage title="Spoilt / Delayed" />
}