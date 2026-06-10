import { LoaderCircle } from 'lucide-react';

/**
 * Shared spinner used for pending UI states.
 */
export function Loader() {
  return (
    <LoaderCircle className="animate-spin text-white" strokeWidth={2.25} />
  );
}
