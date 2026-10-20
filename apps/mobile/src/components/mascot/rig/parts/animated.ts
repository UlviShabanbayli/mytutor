import Animated from 'react-native-reanimated';
import { Circle, Ellipse, G, Path } from 'react-native-svg';

/** react-native-svg shapes whose geometry the rig drives from the UI thread. */
export const APath = Animated.createAnimatedComponent(Path);
export const ACircle = Animated.createAnimatedComponent(Circle);
export const AEllipse = Animated.createAnimatedComponent(Ellipse);
export const AG = Animated.createAnimatedComponent(G);
