# Reusable Components Documentation

## ThemedStatusBar Component

A reusable StatusBar component that automatically adapts to the current theme (light/dark).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lightThemeStyle` | `'default' \| 'light-content' \| 'dark-content'` | `'dark-content'` | Bar style when in light theme |
| `darkThemeStyle` | `'default' \| 'light-content' \| 'dark-content'` | `'light-content'` | Bar style when in dark theme |
| `backgroundColor` | `string` | Auto determined | Background color for Android status bar |
| Other StatusBar props | See React Native StatusBar | - | All other StatusBar props are passed through |

### Usage

```tsx
import ThemedStatusBar from '../components/ThemedStatusBar';

const MyScreen = () => {
  return (
    <>
      <ThemedStatusBar />
      {/* Your screen content */}
    </>
  );
};
```

## ThemedLayout Component

A complete layout wrapper that combines SafeAreaView with ThemedStatusBar for consistent cross-platform layouts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Content to be wrapped |
| `style` | `StyleProp<ViewStyle>` | - | Additional styles to apply |
| `withStatusBar` | `boolean` | `true` | Whether to include ThemedStatusBar |
| `statusBarProps` | `ThemedStatusBarProps` | - | Props to pass to ThemedStatusBar |
| `edges` | `Array<'top' \| 'right' \| 'bottom' \| 'left'>` | `['right', 'left', 'bottom']` | Safe area edges to respect |

### Usage

```tsx
import ThemedLayout from '../components/ThemedLayout';

const MyScreen = () => {
  return (
    <ThemedLayout>
      <View style={{ flex: 1 }}>
        {/* Your screen content */}
      </View>
    </ThemedLayout>
  );
};
```

### Special Cases

For screens with bottom tab navigation, exclude the bottom edge to avoid extra padding:

```tsx
<ThemedLayout edges={['top']}>
  {/* Screen content */}
</ThemedLayout>
```

### Benefits

- **Automatic theme adaptation**: Status bar color and icon color adjust automatically
- **Cross-platform compatibility**: Handles both iOS and Android differences
- **Safe area handling**: Properly handles notches, home indicators, and cutouts
- **Consistent spacing**: Maintains consistent padding across devices
- **Reduced boilerplate**: Eliminates repetitive SafeAreaView and StatusBar code