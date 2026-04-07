import { useState } from 'react'
import { useClaims } from '../hooks/useClaims'
import { RATES } from '../lib/supabase'
import { ClaimRow, ClaimDetailSheet, EmptyState, fmtAUD } from '../components/UI'
import { useAuth } from '../hooks/useAuth'
import DistrictStationSelect from '../components/DistrictStationSelect'

const PLATOONS = ['A', 'B', 'C', 'D', 'Z']

// ── SHARED FORM WRAPPER ───────────────────────────────────────
function FormCard({ title, children, onSubmit, submitting }) {
  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="card-header"><h3>{title}</h3></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
        <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
          {submitting
            ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            : 'Save claim'
          }
        </button>
      </div>
    </form>
  )
}

// ── CLAIM LIST SECTION ────────────────────────────────────────
function ClaimList({ claims, type, table, markPaid, deleteClaim }) {
  const [selected, setSelected] = useState(null)
  const pending = claims.filter(c => c.status === 'Pending')
  const pendingAmt = pending.reduce((s, c) => {
    const a = type === 'Spoilt' ? c.meal_amount : c.total_amount
    return s + (a || 0)
  }, 0)

  return (
    <>
      {pendingAmt > 0 && (
        <div className="amount-bar">
          <span className="amount-bar-label">Pending {type.toLowerCase()} total</span>
          <span className="amount-bar-value">{fmtAUD(pendingAmt)}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '12px 16px' }}>
          <h3>{type} claims</h3>
          <span className="badge badge-gray">{claims.length}</span>
        </div>
        {claims.length > 0
          ? claims.map(c => (
              <ClaimRow key={c.id} claim={c} type={type} onClick={() => setSelected(c)} />
            ))
          : <EmptyState icon="📋" message={`No ${type.toLowerCase()} claims yet.`} />
        }
      </div>

      {selected && (
        <ClaimDetailSheet
          claim={selected}
          type={type}
          table={table}
          onClose={() => setSelected(null)}
          onMarkPaid={markPaid}
          onDelete={deleteClaim}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// RECALLS PAGE
// ─────────────────────────────────────────────────────────────
export function RecallsPage() {
  const { recalls, addRecall, markPaid, deleteClaim } = useClaims()
  const { profile } = useAuth()
  const [form, setForm] = useState({
    date: '', rosteredStnId: profile?.station_id || '', recallStnId: '',
    platoon: profile?.platoon || 'C', shift: 'Night', arrived: '',
    distHomeKm: profile?.home_dist_km || '', distStnKm: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const km = (parseFloat(form.distHomeKm) || 0) + (parseFloat(form.distStnKm) || 0)
  const travel = +(km * RATES.kmRate).toFixed(2)
  const mealie = form.shift === 'Night' ? RATES.nightMealie : RATES.dayMealie
  const estTotal = travel + mealie

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    setSubmitting(true)
    const { error } = await addRecall(form)
    if (error) setError(error.message)
    else setForm(f => ({ ...f, date: '', recallStnId: '', arrived: '', distStnKm: '', notes: '' }))
    setSubmitting(false)
  }

  return (
    <div className="page">
      <FormCard title="New recall claim" onSubmit={handleSubmit} submitting={submitting}>
        {error && <div className="auth-error">{error}</div>}

        <div className="grid-2">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} required />
          </div>
          <div className="field">
            <label>Shift</label>
            <select value={form.shift} onChange={set('shift')}>
              <option>Day</option><option>Night</option>
            </select>
          </div>
        </div>

        <DistrictStationSelect
          label="Rostered station"
          stationId={form.rosteredStnId ? Number(form.rosteredStnId) : ''}
          onChange={(val) => setForm(f => ({ ...f, rosteredStnId: val }))}
        />
        <DistrictStationSelect
          label="Recall station"
          stationId={form.recallStnId ? Number(form.recallStnId) : ''}
          onChange={(val) => setForm(f => ({ ...f, recallStnId: val }))}
        />

        <div className="grid-2">
          <div className="field">
            <label>Platoon</label>
            <select value={form.platoon} onChange={set('platoon')}>
              {PLATOONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Arrival time (HHMM)</label>
            <input type="text" value={form.arrived} onChange={set('arrived')} placeholder="e.g. 1940" maxLength={4} />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Home → rostered stn (km return)</label>
            <input type="number" value={form.distHomeKm} onChange={set('distHomeKm')} placeholder="0" min="0" step="0.5" />
          </div>
          <div className="field">
            <label>Rostered → recall stn (km return)</label>
            <input type="number" value={form.distStnKm} onChange={set('distStnKm')} placeholder="0" min="0" step="0.5" />
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <input type="text" value={form.notes} onChange={set('notes')} placeholder="Optional" />
        </div>

        {km > 0 && (
          <div className="info-box">
            Est. travel: {fmtAUD(travel)} + mealie: {fmtAUD(mealie)} = <strong>{fmtAUD(estTotal)}</strong>
          </div>
        )}
      </FormCard>

      <ClaimList claims={recalls} type="Recall" table="recalls" markPaid={markPaid} deleteClaim={deleteClaim} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// RETAIN PAGE
// ─────────────────────────────────────────────────────────────
export function RetainPage() {
  const { retain, addRetain, markPaid, deleteClaim } = useClaims()
  const { profile } = useAuth()
  const [form, setForm] = useState({
    date: '', stationId: profile?.station_id || '',
