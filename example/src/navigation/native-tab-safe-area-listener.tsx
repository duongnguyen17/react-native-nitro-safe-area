import { useMemo, useState, useEffect, type ReactNode } from 'react';
import {
  getContentInsets,
  addOnSafeAreaChangedListener,
  type EdgeInsets,
} from '@2security/nitro-safe-area';
import { ScopedVariables } from 'uniwind';

export const NativeTabSafeAreaListener = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Synchronous initialization on Frame 0 directly from Nitro Modules!
  // Completely eliminates the 0px -> actual_inset jump (Zero Layout Shift).
  const [insets, setInsets] = useState<EdgeInsets>(() => getContentInsets());

  useEffect(() => {
    return addOnSafeAreaChangedListener((metrics) => {
      setInsets(metrics.contentInsets);
    });
  }, []);

  const variables = useMemo(
    () => ({
      '--safe-native-top': insets.top,
      '--safe-native-right': insets.right,
      '--safe-native-bottom': insets.bottom,
      '--safe-native-left': insets.left,
    }),
    [insets]
  );

  return (
    <ScopedVariables variables={variables}>
      {children}
    </ScopedVariables>
  );
};

export const renderNativeTabSafeAreaLayout = ({
  children,
}: {
  children: ReactNode;
}) => <NativeTabSafeAreaListener>{children}</NativeTabSafeAreaListener>;
