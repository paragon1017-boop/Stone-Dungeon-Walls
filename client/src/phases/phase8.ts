// Phase 8 MVP: perf improvements groundwork (no surface API changes yet)
export function enablePerformanceMode(): boolean {
  try { localStorage.setItem('perf_mode','on') } catch {}
  return true
}
export function isPerformanceEnabled(): boolean {
  try { return localStorage.getItem('perf_mode') === 'on' } catch { return false }
}
export default { enablePerformanceMode, isPerformanceEnabled }
