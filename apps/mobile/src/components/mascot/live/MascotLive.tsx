import { GreetVizi } from './GreetVizi';
import { IdleVizi } from './IdleVizi';
import { LoadingVizi } from './LoadingVizi';
import { ScriptedVizi } from './ScriptedVizi';
import { SleepyVizi } from './SleepyVizi';
import { StreakVizi } from './StreakVizi';
import type { LiveMascotProps } from './types';

/** Picks the live Vızı for a behaviour (see `MascotBehavior`). */
export function MascotLive(props: LiveMascotProps) {
  switch (props.behavior) {
    case 'idle':
    case 'tap':
      return <IdleVizi {...props} />;
    case 'greet':
      return <GreetVizi {...props} />;
    case 'loading':
      return <LoadingVizi {...props} />;
    case 'sleepy':
      return <SleepyVizi {...props} />;
    case 'streak':
      return <StreakVizi {...props} />;
    case 'correct':
    case 'wrong':
    case 'done':
    case 'think':
      return <ScriptedVizi {...props} behavior={props.behavior} />;
  }
}
