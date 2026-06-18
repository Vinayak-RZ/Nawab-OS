/** Text formatting and escaping */
export function esc(s) {
  const d = document.createElement("div");
  d.textContent = s ?? "";
  return d.innerHTML;
}

export function fmtMoney(n) {
  return "$" + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function fmtTime(ts) {
  if (!ts) return "";
  const d = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts);
  return d.toLocaleString();
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function registerFormat(ctx) {
  ctx.esc = esc;
  ctx.fmtMoney = fmtMoney;
  ctx.fmtTime = fmtTime;
  ctx.sleep = sleep;
}
