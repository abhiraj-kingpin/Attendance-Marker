/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  // Font weight utilities are redefined below to also carry font family.
  corePlugins: {
    fontWeight: false,
  },
  theme: {
    extend: {
      colors: {
        // CSS custom properties driven from src/lib/theme.js + App.js.
        'g-blue': 'var(--color-g-blue, #4285F4)',
        'g-blue-container': 'var(--color-g-blue-container, #D3E3FD)',
        'g-blue-dark': 'var(--color-g-blue-dark, #1A56DB)',
        'g-red': 'var(--color-g-red, #EA4335)',
        'g-red-container': 'var(--color-g-red-container, #FCE8E6)',
        'g-red-dark': 'var(--color-g-red-dark, #B3261E)',
        'g-yellow': 'var(--color-g-yellow, #FBBC04)',
        'g-yellow-container': 'var(--color-g-yellow-container, #FEEFC3)',
        'g-yellow-dark': 'var(--color-g-yellow-dark, #A35A00)',
        'g-green': 'var(--color-g-green, #34A853)',
        'g-green-container': 'var(--color-g-green-container, #E6F4EA)',
        'g-green-dark': 'var(--color-g-green-dark, #1E7E34)',

        surface: 'var(--color-surface, #FFFFFF)',
        'surface-variant': 'var(--color-surface-variant, #F8F9FA)',
        'surface-variant-2': 'var(--color-surface-variant-2, #F1F3F4)',
        'on-surface': 'var(--color-on-surface, #1F1F1F)',
        'on-surface-secondary': 'var(--color-on-surface-secondary, #444746)',
        'on-surface-tertiary': 'var(--color-on-surface-tertiary, #5F6368)',
        outline: 'var(--color-outline, #C4C7C5)',
        'outline-variant': 'var(--color-outline-variant, #E8EAED)',
      },
      // Matches BASE_FONT_SIZES in src/lib/theme.js.
      fontSize: {
        '2xs': 'var(--fs-2xs, 11px)',
        xs: 'var(--fs-xs, 12px)',
        sm: 'var(--fs-sm, 12px)',
        base: 'var(--fs-base, 14px)',
        lg: 'var(--fs-lg, 16px)',
        xl: 'var(--fs-xl, 18px)',
        '2xl': 'var(--fs-2xl, 21px)',
        '3xl': 'var(--fs-3xl, 26px)',
        '4xl': 'var(--fs-4xl, 32px)',
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      const weights = {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      };
      addUtilities(
        Object.fromEntries(
          Object.entries(weights).map(([name, weight]) => [
            `.font-${name}`,
            { fontWeight: weight, fontFamily: 'var(--font-family, sans-serif)' },
          ])
        )
      );
    },
  ],
};
