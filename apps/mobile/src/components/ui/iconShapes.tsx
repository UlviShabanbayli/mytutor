// Icon set of the arı design (24pt grid, 2.2 stroke, round caps). Generated from the design
// canvas "arı — tətbiq dizaynı"; keep names in sync with it. Strokes inherit from <Icon>.
import type { ReactNode } from 'react';
import { Circle, Path, Rect } from 'react-native-svg';

export const iconShapes = {
  today: (
    <>
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  learn: (
    <>
      <Path d="M8 2.8 11 4.5v3.4L8 9.6 5 7.9V4.5zM16 2.8l3 1.7v3.4l-3 1.7-3-1.7V4.5zM12 9.6l3 1.7v3.4l-3 1.7-3-1.7v-3.4zM8 16.4l3 1.7" />
    </>
  ),
  ask: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <Circle cx={12} cy={13.5} r={3.5} />
    </>
  ),
  exam: (
    <>
      <Path d="M5 21V4M5 4h11l-2.2 4L16 12H5" />
    </>
  ),
  me: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <Path d="M10 21h4" />
    </>
  ),
  back: (
    <>
      <Path d="M15 5l-7 7 7 7" />
    </>
  ),
  close: (
    <>
      <Path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  chevron: (
    <>
      <Path d="M9 5l7 7-7 7" />
    </>
  ),
  down: (
    <>
      <Path d="M5 9l7 7 7-7" />
    </>
  ),
  check: (
    <>
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </>
  ),
  x: (
    <>
      <Path d="M7 7l10 10M17 7 7 17" />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={10.5} width={14} height={10} rx={2.5} />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  play: (
    <>
      <Path d="M8 5.5v13l10.5-6.5z" />
    </>
  ),
  pause: (
    <>
      <Path d="M8 5v14M16 5v14" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  drop: (
    <>
      <Path d="M12 3c3 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.8 6-11z" />
    </>
  ),
  wing: (
    <>
      <Path d="M3.5 17.5C5 10 11 5 20.5 4c-.6 8.6-5.6 14.2-13 15.5-2.2.4-3.6-.6-4-2z" />
      <Path d="M8 15c3-3 6-5.5 9-7" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z" />
    </>
  ),
  book: (
    <>
      <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <Path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    </>
  ),
  chat: (
    <>
      <Path d="M4 5h16v11H9l-5 4z" />
    </>
  ),
  send: (
    <>
      <Path d="M4 12 20 4l-6 16-3-7z" />
    </>
  ),
  image: (
    <>
      <Rect x={3.5} y={4.5} width={17} height={15} rx={2.5} />
      <Circle cx={9} cy={10} r={1.8} />
      <Path d="M20.5 16l-5-5-9 8.5" />
    </>
  ),
  crop: (
    <>
      <Path d="M6 2.5V18h15.5M2.5 6H18v15.5" />
    </>
  ),
  flash: (
    <>
      <Path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />
    </>
  ),
  search: (
    <>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="M16 16l4.5 4.5" />
    </>
  ),
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  users: (
    <>
      <Circle cx={9} cy={8.5} r={3.5} />
      <Path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <Path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c2.2.6 3.5 2.4 3.5 5.2" />
    </>
  ),
  calendar: (
    <>
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} />
      <Path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  download: (
    <>
      <Path d="M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15" />
    </>
  ),
  offline: (
    <>
      <Path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M14.5 10.2a10 10 0 0 1 4.5 2.3M2 9a15 15 0 0 1 4.5-2.8M11 5.6A15 15 0 0 1 22 9" />
      <Circle cx={12} cy={20} r={0.8} />
    </>
  ),
  refresh: (
    <>
      <Path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
    </>
  ),
  trophy: (
    <>
      <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <Path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5A3.5 3.5 0 0 1 16.5 11" />
    </>
  ),
  medal: (
    <>
      <Circle cx={12} cy={15} r={5.5} />
      <Path d="M8.5 10.5 5.5 3h4l2.5 5.5M15.5 10.5l3-7.5h-4L12 8.5" />
    </>
  ),
  chart: (
    <>
      <Path d="M4 20.5h16.5M7 17v-5M12 17V7M17 17v-8" />
    </>
  ),
  target: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.5} />
      <Circle cx={12} cy={12} r={0.9} />
    </>
  ),
  plus: (
    <>
      <Path d="M12 5v14M5 12h14" />
    </>
  ),
  mic: (
    <>
      <Rect x={9} y={3} width={6} height={11} rx={3} />
      <Path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  video: (
    <>
      <Rect x={3} y={6} width={13} height={12} rx={2.5} />
      <Path d="M16 10.5l5-3v9l-5-3z" />
    </>
  ),
  hand: (
    <>
      <Path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5.5a1.5 1.5 0 0 1 3 0v8c0 4.5-2.5 7.5-6.5 7.5-3 0-4.5-1.5-6-4l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L8 13" />
    </>
  ),
  report: (
    <>
      <Path d="M5 21V4h11l-1.5 3.5L16 11H5" />
      <Path d="M10 7v2" />
    </>
  ),
  eye: (
    <>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <Circle cx={12} cy={12} r={3} />
    </>
  ),
  globe: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z" />
    </>
  ),
  moon: (
    <>
      <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </>
  ),
  volume: (
    <>
      <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  file: (
    <>
      <Path d="M6 3h8l4.5 4.5V21H6z" />
      <Path d="M14 3v4.5h4.5" />
    </>
  ),
  edit: (
    <>
      <Path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z" />
      <Path d="M13.5 7l3.5 3.5" />
    </>
  ),
  link: (
    <>
      <Path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0L5 13.3A4 4 0 0 0 10.7 19l1.2-1.2" />
    </>
  ),
  filter: (
    <>
      <Path d="M4 5.5h16l-6.2 7.4V19l-3.6 1.5v-7.6z" />
    </>
  ),
  info: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5.5M12 7.6v.1" />
    </>
  ),
  warning: (
    <>
      <Path d="M12 3.5 21.5 20h-19z" />
      <Path d="M12 10v4.5M12 17.4v.1" />
    </>
  ),
  bolt: (
    <>
      <Path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" />
    </>
  ),
  key: (
    <>
      <Circle cx={8} cy={15} r={4.5} />
      <Path d="M11.2 11.8 20 3M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>
  ),
  phone: (
    <>
      <Rect x={6.5} y={2.5} width={11} height={19} rx={2.5} />
      <Path d="M10.5 18.5h3" />
    </>
  ),
  more: (
    <>
      <Circle cx={5.5} cy={12} r={1} />
      <Circle cx={12} cy={12} r={1} />
      <Circle cx={18.5} cy={12} r={1} />
    </>
  ),
  gift: (
    <>
      <Rect x={3.5} y={8.5} width={17} height={4} rx={1} />
      <Path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5C10.5 5 7 4.5 7 6.8 7 8.5 12 8.5 12 8.5zM12 8.5c1.5-3.5 5-4 5-1.7 0 1.7-5 1.7-5 1.7z" />
    </>
  ),
  star: (
    <>
      <Path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <Circle cx={12} cy={13.5} r={3.5} />
    </>
  ),
  rotate: (
    <>
      <Path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5" />
    </>
  ),
  list: (
    <>
      <Path d="M9 6h11M9 12h11M9 18h11M4.5 6h.1M4.5 12h.1M4.5 18h.1" />
    </>
  ),
  grid: (
    <>
      <Rect x={4} y={4} width={7} height={7} rx={1.5} />
      <Rect x={13} y={4} width={7} height={7} rx={1.5} />
      <Rect x={4} y={13} width={7} height={7} rx={1.5} />
      <Rect x={13} y={13} width={7} height={7} rx={1.5} />
    </>
  ),
  logout: (
    <>
      <Path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  trash: (
    <>
      <Path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20.5h9l1-14" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-6.5-6-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" />
      <Circle cx={12} cy={9.5} r={2.3} />
    </>
  ),
  mail: (
    <>
      <Rect x={3} y={5.5} width={18} height={13} rx={2.5} />
      <Path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof iconShapes;
