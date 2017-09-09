## Pallypal

Generate a color palette based on a chosen color.  Provides semantic named color variables i.e `$ocean-blue` instead of `rbg(0, 0, 50)` or `$primary-color-0-0-1`, as often seen in other palette generators.  The actual values will be provided as hex values.

# TODO
1. ~~export to stylesheets~~
2. page to just open in new window with plain text printed (no file download)
3. better display of main color that is selected
4. include selected color in palette
5. add color-scheme-js variations as option
6. mobile
7. refactor as npm package (e.g. var pallypal = new PallyPal())
8. credits within code

# Credits

Uses:
- [tinycolor2](https://github.com/bgrins/TinyColor) for many color manipulations (hsv => hsl => hex)
- [color-scheme-js](https://github.com/c0bra/color-scheme-js) for the palette generation
- [name that color](http://www.chir.ag/projects/ntc) by chirag mehta for semantic color names, using the [npm package here](https://www.npmjs.com/package/ntc)
