import { useRef, useState } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { hslToHex } from '../lib/theme';

const TRACK_HEIGHT = 16;
const THUMB_SIZE = 30;
const ROW_HEIGHT = 40;

const RAINBOW_STOPS = Array.from({ length: 13 }, (_, i) => hslToHex(i * 30, 85, 55));

export default function HueSlider({ value, onChange }) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function updateFromX(x) {
    const w = widthRef.current;
    if (!w) return;
    const clamped = Math.max(0, Math.min(w, x));
    onChangeRef.current(Math.round((clamped / w) * 360));
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => updateFromX(evt.nativeEvent.locationX),
    })
  ).current;

  const thumbX = width ? (value / 360) * width : 0;

  return (
    <View
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      {...panResponder.panHandlers}
      style={{ height: ROW_HEIGHT, justifyContent: 'center' }}
    >
      <Svg width="100%" height={TRACK_HEIGHT}>
        <Defs>
          <LinearGradient id="hueTrack" x1="0" y1="0" x2="1" y2="0">
            {RAINBOW_STOPS.map((c, i) => (
              <Stop key={i} offset={i / (RAINBOW_STOPS.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} fill="url(#hueTrack)" />
      </Svg>
      {width > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: Math.max(0, Math.min(width - THUMB_SIZE, thumbX - THUMB_SIZE / 2)),
            top: (ROW_HEIGHT - THUMB_SIZE) / 2,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: hslToHex(value, 80, 55),
            borderWidth: 3,
            borderColor: '#FFFFFF',
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
          }}
        />
      )}
    </View>
  );
}
