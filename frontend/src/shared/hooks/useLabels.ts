import { useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { verticalLabels } from '../constants/labels';

export function useLabels() {
  const { tenant } = useTenant();
  const verticalSlug = (tenant?.verticalSlug || 'default').toLowerCase();

  return useMemo(() => {
    return verticalLabels[verticalSlug] || verticalLabels.default;
  }, [verticalSlug]);
}
