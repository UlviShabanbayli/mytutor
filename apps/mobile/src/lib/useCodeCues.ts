import { useEffect, useRef } from 'react';
import { playCue } from './cues';

/**
 * micro.otp A: a selection tick for every character typed, and one warning when a code turns
 * out wrong. Deleting is silent.
 */
export function useCodeCues(value: string, error: boolean): void {
  const length = useRef(value.length);
  const wasError = useRef(error);

  useEffect(() => {
    if (value.length > length.current) playCue('select');
    length.current = value.length;
  }, [value]);

  useEffect(() => {
    if (error && !wasError.current) playCue('warning');
    wasError.current = error;
  }, [error]);
}
