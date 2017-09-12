## Pallypal

Generate a color palette based on a chosen color.  Provides semantic named color variables i.e `$color-ocean-blue` instead of `rbg(0, 0, 50)` or `$primary-color-0-0-1`, as often seen in other palette generators.  The actual values will be provided as hex values.

## Context

I often found myself far into a project with CSS color variable names like `$border-color`, `$dark-red`, and `$success-green`.  Suddenly I would have headings that are `$border-color` and `$darker-red` buttons.  I prefer to remove the color variable names from their context (target element, use case, nature relative to other colors in palette) and define them independently.  I would generate a palette using several online / Atom tools until I had it formatted this semantic way.  I finally decided to build the tool that did it all for me.  Give it a try and all feedback is appreciated, thanks!

## Usage

Click anywhere to generate a color palette.  The information for the current color is displayed at the bottom of the screen. The type of palette is changed with the 'Scheme' select, while further variations of the palette are made with the 'Variation' select.

Colors can also be input directly to the bottom inputs via hex code or RGB values.

Use the 'Export' button to download the chosen palette in the stylesheet format of your choice (CSS, SCSS, or Sass).

## npm package

The color palette/naming portion of this code is available as an `npm` package via [this repo](https://github.com/graysonhicks/pallypal-js).

# Credits

Uses:
- [tinycolor2](https://github.com/bgrins/TinyColor) for many color manipulations (hsv => hsl => hex)
- [color-scheme-js](https://github.com/c0bra/color-scheme-js) for the palette generation
- [name that color](http://www.chir.ag/projects/ntc) by chirag mehta for semantic color names, using the [npm package here](https://www.npmjs.com/package/ntc)
