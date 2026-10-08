'use client';

import { useState } from 'react';
import { INSTAGRAM } from '@/lib/data';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; // digits only, e.g. 919876543210. Unset until Rubz confirms.

export default function BookingForm() {
  const [v, setV] = useState({
    name: '', organisation: '', event_type: 'college fest', event_date: '', city: '',
    crowd: '500 to 2,000', notes: '', website: '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const text =
    `Hi Rubz, this is ${v.name.trim() || 'there'}${v.organisation.trim() ? ' from ' + v.organisation.trim() : ''}. ` +
    `We are planning a ${v.event_type}${v.city.trim() ? ' in ' + v.city.trim() : ''}${v.event_date ? ' on ' + v.event_date : ''}, ` +
    `with around ${v.crowd} people.${v.notes.trim() ? ' ' + v.notes.trim() : ''} Could you share your availability and rates?`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setMsg('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setState('sent');
      setMsg('Sent. Rubz will get back to you.');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Copied. Paste it into a DM.');
    } catch {
      setMsg('Select the text above and copy it.');
    }
  }

  return (
    <form onSubmit={submit} autoComplete="off">
      <div className="f"><label htmlFor="fName">Your name</label>
        <input id="fName" required maxLength={80} value={v.name} onChange={set('name')} placeholder="Aarav" /></div>
      <div className="f"><label htmlFor="fOrg">College / organisation</label>
        <input id="fOrg" maxLength={120} value={v.organisation} onChange={set('organisation')} placeholder="Your college or brand" /></div>
      <div className="f"><label htmlFor="fType">Event</label>
        <select id="fType" value={v.event_type} onChange={set('event_type')}>
          {['college fest', 'club night', 'corporate event', 'private party', 'wedding or sangeet', 'festival'].map((o) => <option key={o}>{o}</option>)}
        </select></div>
      <div className="f"><label htmlFor="fDate">Date</label>
        <input id="fDate" type="date" value={v.event_date} onChange={set('event_date')} /></div>
      <div className="f"><label htmlFor="fCity">City</label>
        <input id="fCity" maxLength={80} value={v.city} onChange={set('city')} placeholder="Bengaluru" /></div>
      <div className="f"><label htmlFor="fCrowd">Expected crowd</label>
        <select id="fCrowd" value={v.crowd} onChange={set('crowd')}>
          {['under 500', '500 to 2,000', '2,000 to 5,000', '5,000+'].map((o) => <option key={o}>{o}</option>)}
        </select></div>
      <div className="f full"><label htmlFor="fNotes">Anything else</label>
        <textarea id="fNotes" maxLength={1000} value={v.notes} onChange={set('notes')} placeholder="Stage setup, lineup, budget range" /></div>
      <div className="hp" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} /></label>
      </div>
      <div className="out" aria-live="polite">{text}</div>
      <div className="formbtns">
        <button className="btn solid" type="submit" disabled={state === 'sending' || state === 'sent'}>
          {state === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
        {WHATSAPP && (
          <a className="btn" target="_blank" rel="noopener" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`}>WhatsApp</a>
        )}
        <button className="btn" type="button" onClick={copy}>Copy enquiry</button>
        <a className="btn" href={INSTAGRAM} target="_blank" rel="noopener">Open Instagram</a>
        <span className="status" role="status">{msg}</span>
      </div>
    </form>
  );
}
