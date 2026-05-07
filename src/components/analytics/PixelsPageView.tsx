'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PixelsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // TikTok Pixel SPA navigation support
    try {
      window.ttq?.page?.();
    } catch {
      // ignore
    }

    // Meta Pixel SPA navigation support
    try {
      window.fbq?.('track', 'PageView');
    } catch {
      // ignore
    }
  }, [pathname, searchParams]);

  return null;
}

