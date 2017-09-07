## named color palette

Generate a color palette based on a chosen color.  Provides semantic named color variables i.e `$ocean-blue` instead of `rbg(0, 0, 50)` or `$primary-color-0-0-1`, as often seen in other palette generators.  The actual values will be provided as hex values.

# TODO
1. export to stylesheet
2. mobile
3. credits within code

# Credits

Uses:
- [tinycolor2](https://github.com/bgrins/TinyColor) for many color manipulations (hsv, hsl, hex)
- [color-scheme-js](https://github.com/c0bra/color-scheme-js) for the palette generation
- [name that color](http://www.chir.ag/projects/ntc) by chirag mehta for semantic color names, using the [npm package here](https://www.npmjs.com/package/ntc)
