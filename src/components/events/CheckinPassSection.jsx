import React, { useEffect, useState } from 'react';
import { QRCode } from 'antd';
import { fetchCheckinPass, fetchEventWithSessions, markOwnAttendance } from '../../api/events.api';
import {
  canShowCheckin,
  checkinErrorMessage,
  checkinSessions,
  formatLocal,
} from '../../helpers/checkinPass.helper';

// P5 attendance. In person: show this pass to the organiser, who scans it - the pass alone never
// records attendance. Online sessions: "Mark attendance" inside the check-in window.
const CheckinPassSection = ({ event }) => {
  const [pass, setPass] = useState(null); // { sessionId, token, expiresAt }
  const [notice, setNotice] = useState(null); // { sessionId, text, ok }
  const [busy, setBusy] = useState(null);
  const [loaded, setLoaded] = useState([]);
  const eligible = canShowCheckin(event);
  const inline = checkinSessions(event);
  const eventId = event?.id || event?.raw?._id;

  // The events list carries no sessions - load them from the event detail when needed.
  useEffect(() => {
    if (!eligible || inline.length || !eventId) return undefined;
    let cancelled = false;
    fetchEventWithSessions(eventId).then((res) => {
      if (!cancelled && res?.status >= 200 && res?.status < 300) {
        setLoaded(checkinSessions({ sessions: res.data?.data?.sessions }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eligible, eventId, inline.length]);

  if (!eligible) return null;
  const sessions = inline.length ? inline : loaded;
  if (!sessions.length) return null;

  const showPass = async (session) => {
    setBusy(session.id);
    setNotice(null);
    const res = await fetchCheckinPass(event.registrationId, session.id);
    setBusy(null);
    if (res?.status >= 200 && res?.status < 300 && res.data?.data?.token) {
      setPass({ sessionId: session.id, token: res.data.data.token, expiresAt: res.data.data.expiresAt });
    } else {
      setPass(null);
      setNotice({ sessionId: session.id, text: checkinErrorMessage(res), ok: false });
    }
  };

  const markOnline = async (session) => {
    setBusy(session.id);
    setNotice(null);
    const res = await markOwnAttendance(event.registrationId, session.id);
    setBusy(null);
    const ok = res?.status >= 200 && res?.status < 300;
    setNotice({
      sessionId: session.id,
      ok,
      text: ok
        ? res.data?.data?.alreadyCheckedIn
          ? 'Your attendance was already recorded.'
          : 'Attendance recorded.'
        : checkinErrorMessage(res),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h4 className="mb-2 text-sm font-bold text-slate-900">Check-in</h4>
      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">{s.label}</span>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
                disabled={busy === s.id}
                onClick={() => showPass(s)}>
                Show check-in pass
              </button>
              {s.isVirtual && (
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                  disabled={busy === s.id}
                  onClick={() => markOnline(s)}>
                  Mark attendance (online)
                </button>
              )}
            </div>
            {pass?.sessionId === s.id && (
              <div className="mt-2 flex flex-col items-start gap-1">
                <QRCode value={pass.token} size={180} />
                <span className="text-xs text-slate-600">
                  Show this to the event organiser to check in.
                  {pass.expiresAt ? ` Valid until ${formatLocal(pass.expiresAt)}.` : ''}
                </span>
              </div>
            )}
            {notice?.sessionId === s.id && (
              <p className={`mt-1 text-xs ${notice.ok ? 'text-green-700' : 'text-red-700'}`}>{notice.text}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckinPassSection;
