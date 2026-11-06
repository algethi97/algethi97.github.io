const SUPABASE_CONFIG = {
  url: 'https://fspkdczsrfoyebznfkwr.supabase.co',
  key: 'sb_publishable_oZWWsYIiUzSB6-9F5I5bdw_sLakHhyW'
};

let supabaseClient = null;

// SDK가 준비된 뒤 최초 호출에서만 클라이언트를 생성한다.
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase || !window.supabase.createClient) return null;
  supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  return supabaseClient;
}

// 옵션으로 방명록의 시각·잘못된 날짜 처리와 게임의 날짜 표시를 유지한다.
export function formatTimeAgo(isoString, { includeTime = false, invalidAsEmpty = false } = {}) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (invalidAsEmpty && isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const pad = n => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  return includeTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

export function setButtonLoading(button, isLoading, { textMode = 'hide' } = {}) {
  if (!button) return;
  const text = button.querySelector('.btn-text');
  const loader = button.querySelector('.btn-loader');
  button.disabled = isLoading;
  if (text) {
    if (textMode === 'dim') text.style.opacity = isLoading ? '0.5' : '1';
    else text.style.display = isLoading ? 'none' : 'inline';
  }
  if (loader) loader.style.display = isLoading ? 'inline-block' : 'none';
}
