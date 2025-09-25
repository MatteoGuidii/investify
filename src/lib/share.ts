// Share utilities: builds a sharable absolute URL (using NEXT_PUBLIC_BASE_URL if provided)
// and attempts Web Share API, falling back to clipboard.

export interface ShareOptions {
  path: string;              // e.g. '/wrap/2025'
  title?: string;            // share title
  text?: string;             // share text/description
  // Optional custom absolute base (overrides env + window origin)
  baseUrlOverride?: string;  
}

export interface ShareResult {
  ok: boolean;
  method: 'web-share' | 'clipboard' | 'none';
  url: string;
  error?: unknown;
}

function resolveBaseUrl(baseUrlOverride?: string): string {
  if (baseUrlOverride) return baseUrlOverride.replace(/\/$/, '');
  // Prefer explicitly configured public base (use when tunneling or deployed)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export async function sharePath(opts: ShareOptions): Promise<ShareResult> {
  const base = resolveBaseUrl(opts.baseUrlOverride);
  const url = base + opts.path;

  // Try Web Share API first (mobile friendly)
  try {
    if (typeof window !== 'undefined' && (navigator as any)?.share) {
      await (navigator as any).share({
        title: opts.title || 'Check this out',
        text: opts.text,
        url,
      });
      return { ok: true, method: 'web-share', url };
    }
  } catch (err) {
    // Swallow and attempt clipboard fallback
    console.warn('Web Share failed, falling back to clipboard', err);
  }

  // Clipboard fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { ok: true, method: 'clipboard', url };
    }
  } catch (err) {
    return { ok: false, method: 'clipboard', url, error: err };
  }

  return { ok: false, method: 'none', url };
}

// Convenience for specific wrap period
export function shareWrap(period: string, overrides?: Partial<ShareOptions>) {
  return sharePath({ path: `/wrap/${period}`, title: overrides?.title || 'My Investing Wrapped', ...overrides });
}
