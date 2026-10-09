import { useUserStore } from '@/viewmodels/userStore';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

export type Chapeu = 'nenhum' | 'toque' | 'boina' | 'bandana';

type Props = {
  size?: number;
  outfit?: 'normal' | 'premium';
  hat?: Chapeu;
  ring?: boolean;
  ringColor?: string;
  circleColor?: string;
  skin?: string;
  hair?: string;
};

export default function Avatar({
  size = 120,
  outfit,
  hat,
  ring = false,
  ringColor = '#E8A736',
  circleColor,
  skin = '#D29B6E',
  hair = '#2A2320',
}: Props) {
  const outfitStore = useUserStore((s) => s.outfit);
  const hatStore = useUserStore((s) => s.equippedHat);
  const corStore = useUserStore((s) => s.avatarColor);

  const look = outfit || outfitStore || 'normal';
  const chapeu = hat || hatStore || 'toque';
  const cor = circleColor || corStore || '#C0392B';
  const premium = look === 'premium';
  const temAnel = premium || ring;
  const rInterno = temAnel ? 46 : 50;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="avatarClip">
          <Circle cx="50" cy="50" r={rInterno} />
        </ClipPath>
      </Defs>

      {temAnel && <Circle cx="50" cy="50" r="50" fill={ringColor} />}
      <Circle cx="50" cy="50" r={rInterno} fill={cor} />

      <G clipPath="url(#avatarClip)">
        <Rect x="42" y="62" width="16" height="22" rx="6" fill={skin} />
        <Ellipse cx="50" cy="102" rx="31" ry="25" fill="#FFFFFF" />
        <Path d="M44 86 Q50 94 56 86" stroke="#E2D8C8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Circle cx="50" cy="52" r="20" fill={skin} stroke="#B5824F" strokeWidth="1.3" />
        <Path d="M30 54 C29 40 36 32 50 32 C64 32 71 40 70 54 C67 48 61 45 55 46 C52 48 50 49 50 49 C50 49 48 48 45 46 C39 45 33 48 30 54 Z" fill={hair} />
        <Circle cx="40" cy="58" r="3.2" fill="#E8846B" opacity="0.45" />
        <Circle cx="60" cy="58" r="3.2" fill="#E8846B" opacity="0.45" />
        <Circle cx="43.5" cy="51" r="2.5" fill="#3A2A20" />
        <Circle cx="56.5" cy="51" r="2.5" fill="#3A2A20" />
        <Path d="M44 58 Q50 63 56 58" stroke="#3A2A20" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {chapeu === 'toque' && (
          <G>
            <Rect x="32" y="32" width="36" height="8" rx="4" fill="#F0F0F0" />
            <Circle cx="40" cy="30" r="8" fill="#FFFFFF" />
            <Circle cx="50" cy="25" r="10" fill="#FFFFFF" />
            <Circle cx="60" cy="30" r="8" fill="#FFFFFF" />
          </G>
        )}
        {chapeu === 'boina' && (
          <G>
            <Ellipse cx="50" cy="32" rx="22" ry="9" fill="#2B2B2B" />
            <Ellipse cx="50" cy="35" rx="20" ry="6" fill="#1F1F1F" />
            <Circle cx="50" cy="22" r="2.4" fill="#2B2B2B" />
          </G>
        )}
        {chapeu === 'bandana' && (
          <G>
            <Path d="M30 38 Q50 27 70 38 Q50 34 30 38 Z" fill="#D63E2A" />
            <Path d="M68 37 l10 -3 l-3 9 Z" fill="#B5321F" />
            <Circle cx="41" cy="35" r="1.5" fill="#FFFFFF" />
            <Circle cx="50" cy="33.5" r="1.5" fill="#FFFFFF" />
            <Circle cx="59" cy="35" r="1.5" fill="#FFFFFF" />
          </G>
        )}
      </G>
    </Svg>
  );
}