'use client';
import { useState } from 'react';
import type { ZoneId } from '@/types/arena.types';

type Incident = {
  id: string;
  zone: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  desc?: string;
  time?: string;
  reportedAt?: number;
};

type FormErrors = {
  zone?: string;
  type?: string;
  severity?: string;
  desc?: string;
};

const MOCK_INCIDENTS: Incident[] = [
  { id: '1', zone: 'North Stand', type: 'Medical', severity: 'medium', desc: 'Dehydration case in Block C', time: '14:22' },
  { id: '2', zone: 'Gate A', type: 'Security', severity: 'low', desc: 'Ticket scanner malfunction', time: '14:05' },
];

const inputClass =
  'w-full bg-[#1E293B] border border-slate-600 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500';
const inputErrorClass =
  'w-full bg-[#1E293B] border border-red-500 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-red-400';
const labelClass = 'text-[10px] text-slate-400 uppercase tracking-wider mb-0.5';

export default function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [showForm, setShowForm] = useState(false);
  const [formZone, setFormZone] = useState<ZoneId | 'all' | ''>('');
  const [formType, setFormType] = useState('');
  const [formSeverity, setFormSeverity] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormZone('');
    setFormType('');
    setFormSeverity('');
    setFormDesc('');
    setFormErrors({});
    setSubmitError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formZone) errors.zone = 'Zone is required.';
    if (!formType) errors.type = 'Type is required.';
    if (!formSeverity) errors.severity = 'Severity is required.';
    if (!formDesc.trim()) errors.desc = 'Description is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone: formZone,
          type: formType,
          severity: formSeverity,
          description: formDesc,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setIncidents(prev => [data.incident, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setSubmitError('Failed to report incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resolveIncident = (id: string) => {
    setIncidents(incidents.filter(i => i.id !== id));
  };

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-black';
      case 'low':
        return 'bg-green-500 text-black';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getDisplayText = (inc: Incident) => inc.description ?? inc.desc ?? '';
  const getDisplayTime = (inc: Incident) => {
    if (inc.time) return inc.time;
    if (inc.reportedAt)
      return new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return '';
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Incident Log</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded"
          >
            + Report Incident
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 bg-[#1E293B] border border-slate-700 rounded p-3 flex flex-col gap-2"
        >
          {/* Zone */}
          <div className="flex flex-col">
            <label className={labelClass}>Zone</label>
            <select
              value={formZone}
              onChange={e => setFormZone(e.target.value as ZoneId | 'all' | '')}
              className={formErrors.zone ? inputErrorClass : inputClass}
            >
              <option value="">Select zone…</option>
              <optgroup label="All">
                <option value="all">All Zones</option>
              </optgroup>
              <optgroup label="Stands">
                <option value="north-stand">North Stand</option>
                <option value="south-stand">South Stand</option>
                <option value="east-stand">East Stand</option>
                <option value="west-stand">West Stand</option>
              </optgroup>
              <optgroup label="Concourses">
                <option value="north-concourse">North Concourse</option>
                <option value="south-concourse">South Concourse</option>
              </optgroup>
              <optgroup label="Gates">
                <option value="gate-a">Gate A</option>
                <option value="gate-b">Gate B</option>
                <option value="gate-c">Gate C</option>
                <option value="gate-d">Gate D</option>
              </optgroup>
              <optgroup label="Concessions">
                <option value="concession-n1">North Food Court 1</option>
                <option value="concession-n2">North Food Court 2</option>
                <option value="concession-n3">North Beverage</option>
                <option value="concession-s1">South Food Court 1</option>
                <option value="concession-s2">South Food Court 2</option>
              </optgroup>
              <optgroup label="Other">
                <option value="medical-bay">Medical Bay</option>
                <option value="vip-lounge">VIP Lounge</option>
              </optgroup>
            </select>
            {formErrors.zone && (
              <p className="text-red-400 text-[10px] mt-0.5">{formErrors.zone}</p>
            )}
          </div>

          {/* Type + Severity */}
          <div className="flex gap-2">
            <div className="flex flex-col flex-1">
              <label className={labelClass}>Type</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className={formErrors.type ? inputErrorClass : inputClass}
              >
                <option value="">Type…</option>
                <option value="medical">Medical</option>
                <option value="security">Security</option>
                <option value="crowd-surge">Crowd Surge</option>
                <option value="facility">Facility</option>
              </select>
              {formErrors.type && (
                <p className="text-red-400 text-[10px] mt-0.5">{formErrors.type}</p>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <label className={labelClass}>Severity</label>
              <select
                value={formSeverity}
                onChange={e => setFormSeverity(e.target.value)}
                className={formErrors.severity ? inputErrorClass : inputClass}
              >
                <option value="">Severity…</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {formErrors.severity && (
                <p className="text-red-400 text-[10px] mt-0.5">{formErrors.severity}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className={labelClass}>Description ({formDesc.length}/200)</label>
            <textarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value.slice(0, 200))}
              rows={2}
              className={`${formErrors.desc ? inputErrorClass : inputClass} resize-none`}
              placeholder="Describe the incident…"
            />
            {formErrors.desc && (
              <p className="text-red-400 text-[10px] mt-0.5">{formErrors.desc}</p>
            )}
          </div>

          {/* Submit-level error */}
          {submitError && <p className="text-red-400 text-[10px]">{submitError}</p>}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded border border-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-red-500 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {incidents.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center mt-4">No active incidents</div>
        ) : (
          incidents.map(inc => (
            <div
              key={inc.id}
              className="bg-[#1E293B] border border-slate-700 p-2 rounded flex justify-between items-start gap-3 group"
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getBadgeColor(inc.severity)}`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{inc.zone}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{getDisplayTime(inc)}</span>
                </div>
                <div className="text-xs text-slate-400">{getDisplayText(inc)}</div>
              </div>
              <button
                onClick={() => resolveIncident(inc.id)}
                className="opacity-0 group-hover:opacity-100 bg-slate-700 hover:bg-green-600 text-white text-[10px] px-2 py-1 rounded transition-all"
              >
                Resolve
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
