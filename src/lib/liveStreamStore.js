/**
 * Live Proctoring & Screen Stream In-Memory Store
 * Caches latest frame & telemetry for active students in exam hall
 */

if (!global._liveStreams) {
  global._liveStreams = new Map();
}

const liveStreams = global._liveStreams;

export function updateStreamFrame({ rollNo, studentName, examId, frame, isLive = true, tabSwitchCount = 0 }) {
  if (!rollNo) return;
  liveStreams.set(rollNo, {
    rollNo,
    studentName: studentName || rollNo,
    examId,
    frame, // base64 JPEG/WebP data URL
    isLive,
    tabSwitchCount,
    updatedAt: Date.now(),
  });
}

export function getAllActiveStreams() {
  const now = Date.now();
  const active = [];

  for (const [rollNo, data] of liveStreams.entries()) {
    // If no update for 45s, mark as offline/stale
    const ageSecs = Math.round((now - data.updatedAt) / 1000);
    const isOnline = ageSecs < 45;
    active.push({
      ...data,
      isOnline,
      ageSecs,
    });
  }

  return active;
}

export function getStreamByRollNo(rollNo) {
  return liveStreams.get(rollNo) || null;
}
