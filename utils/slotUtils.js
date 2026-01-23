export function generateHourlyRanges(startTime = "07:00", endTime = "22:00", durationMins = 60) {
  const toMins = t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const toHHMM = mins => `${String(Math.floor(mins / 60)).padStart(2,"0")}:${String(mins % 60).padStart(2,"0")}`;

  const out = [];
  for (let s = toMins(startTime); s + durationMins <= toMins(endTime); s += durationMins) {
    const e = s + durationMins;
    out.push({ start: toHHMM(s), end: toHHMM(e) });
  }
  return out;
}
