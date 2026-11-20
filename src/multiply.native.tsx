import { NitroModules } from 'react-native-nitro-modules';
import type { NitroSafeArea } from './NitroSafeArea.nitro';

const NitroSafeAreaHybridObject =
  NitroModules.createHybridObject<NitroSafeArea>('NitroSafeArea');

export function multiply(a: number, b: number): number {
  return NitroSafeAreaHybridObject.multiply(a, b);
}
