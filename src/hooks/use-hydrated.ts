'use client';

import { useState, useEffect } from 'react';

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: detect client hydration
    setHydrated(true);
  }, []);
  return hydrated;
}
