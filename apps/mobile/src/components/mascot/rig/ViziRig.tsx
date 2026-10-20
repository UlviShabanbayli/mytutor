import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';
import { useThemeColors } from '@/theme';
import { VIZI } from './data/colors';
import { RigAntenna } from './parts/RigAntenna';
import { RigArms } from './parts/RigArms';
import { RigBrows } from './parts/RigBrows';
import { RigCheeks } from './parts/RigCheeks';
import { RigEye } from './parts/RigEye';
import { RigFrontArm } from './parts/RigFrontArm';
import { RigMouth } from './parts/RigMouth';
import { RigSpeedLines } from './parts/RigSpeedLines';
import { RigTorso } from './parts/RigTorso';
import { RigWing } from './parts/RigWing';
import type { Rig } from './rigValues';

type ViziRigProps = { rig: Rig; size: number; speedLines?: boolean };

/** Room around the 200-unit art for wings, arms, props and the shadow (viewBox units). */
const PAD = 60;

/**
 * Vızı as a rig: nested Views carry the whole-body moves (host → hover → squash → spin → breath,
 * each around its own pivot) and three SVG layers draw the parts: back (wings, antennae, arms,
 * body), face (moves for glances and nods) and front (the arm over the face, props).
 */
export function ViziRig({ rig, size, speedLines = false }: ViziRigProps) {
  const v = rig.v;
  const k = size / 200;
  const c = useThemeColors();
  const id = `vz${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const at = (x: number, y: number) => `${x * k}px ${y * k}px`;
  const canvas = {
    left: -PAD * k,
    top: -PAD * k,
    width: (200 + 2 * PAD) * k,
    height: (200 + 2 * PAD) * k,
  };
  const box = { width: size, height: size };
  const viewBox = `${-PAD} ${-PAD} ${200 + 2 * PAD} ${200 + 2 * PAD}`;

  const host = useAnimatedStyle(() => ({
    opacity: v.hostOpacity.value,
    transform: [
      { translateX: v.hostX.value * k },
      { translateY: v.hostY.value * k },
      { rotate: `${v.hostRot.value}deg` },
      { scaleX: v.hostFlip.value * v.hostScale.value },
      { scaleY: v.hostScale.value },
    ],
  }));
  const shadow = useAnimatedStyle(() => ({
    opacity: v.shadowOp.value,
    transform: [{ scaleX: v.shadowX.value }],
  }));
  const hover = useAnimatedStyle(() => ({ transform: [{ translateY: v.hoverY.value * k }] }));
  const squash = useAnimatedStyle(() => ({
    transform: [{ translateY: v.sqY.value * k }, { scaleX: v.sqX.value }, { scaleY: v.sqS.value }],
  }));
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${v.spin.value}deg` }] }));
  const breath = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${v.brRot.value}deg` },
      { scaleX: v.brX.value },
      { scaleY: v.brS.value },
    ],
  }));
  const face = useAnimatedStyle(() => ({
    transform: [{ translateX: v.faceX.value * k }, { translateY: v.faceY.value * k }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[box, host]}>
      <Animated.View
        style={[styles.layer, canvas, { transformOrigin: at(100 + PAD, 198 + PAD) }, shadow]}
      >
        <Svg width={canvas.width} height={canvas.height} viewBox={viewBox}>
          <Ellipse cx={100} cy={198} rx={46} ry={7} fill={c.shadow} />
          <Ellipse cx={100} cy={198} rx={28} ry={4} fill={c.shadow} />
        </Svg>
      </Animated.View>
      {speedLines ? <RigSpeedLines v={v} size={size} pad={PAD} color={c.muted} /> : null}
      <Animated.View style={[styles.layer, box, hover]}>
        <Animated.View style={[styles.layer, box, { transformOrigin: at(100, 190) }, squash]}>
          <Animated.View style={[styles.layer, box, { transformOrigin: at(100, 110) }, spin]}>
            <Animated.View style={[styles.layer, box, { transformOrigin: at(100, 186) }, breath]}>
              <View className="absolute" style={canvas}>
                <Svg width={canvas.width} height={canvas.height} viewBox={viewBox}>
                  <RigWing v={v} side="L" />
                  <RigWing v={v} side="R" />
                  <RigAntenna v={v} side="L" />
                  <RigAntenna v={v} side="R" />
                  <Ellipse cx={80} cy={186} rx={13} ry={8} fill={VIZI.ink} />
                  <Ellipse cx={120} cy={186} rx={13} ry={8} fill={VIZI.ink} />
                  <RigArms v={v} />
                  <RigTorso clipId={`${id}b`} />
                </Svg>
              </View>
              <Animated.View style={[styles.layer, box, face]}>
                <Svg width={size} height={size} viewBox="0 0 200 200">
                  <RigEye v={v} side="L" clipId={`${id}l`} />
                  <RigEye v={v} side="R" clipId={`${id}r`} />
                  <RigBrows v={v} />
                  <RigCheeks v={v} />
                  <RigMouth v={v} />
                </Svg>
              </Animated.View>
              <View className="absolute" style={canvas}>
                <Svg width={canvas.width} height={canvas.height} viewBox={viewBox}>
                  <RigFrontArm v={v} />
                </Svg>
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// Reanimated views take styles, not classNames: every layer is stacked from the top-left corner.
const styles = StyleSheet.create({ layer: { position: 'absolute', left: 0, top: 0 } });
