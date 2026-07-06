# Modern Minimal Calculator

A beautiful, fully functional, premium web calculator app built with vanilla web technologies (HTML, CSS, JavaScript).

## Features

- **Clean Architecture:** Separation of calculation logic from UI updates via a dedicated `Calculator` class.
- **Premium Design:** Minimal UI, soft rounded corners, dark mode default, with a "Linear/Vercel" aesthetic and a theme toggle.
- **Responsive:** Mobile-first and perfectly usable on any screen size.
- **Keyboard Support:** Full mapping of NumPad and operator keys for desktop power users. Includes visual feedback on keypress.
- **Advanced Logic:** Gracefully handles divide-by-zero, large numbers (auto-shrinking font), floating-point precision issues, and prevents invalid expressions.
- **Accessibility:** Semantic markup, ARIA labels, and proper focus states.

## File Structure

- `index.html`: Contains semantic HTML and accessible UI markup.
- `style.css`: Uses CSS Variables for theming, CSS Grid for the keypad layout, and responsive breakpoints.
- `script.js`: ES6+ class-based logic, event delegation, and state management.

## Setup Instructions

1. Clone or download the repository.
2. Open `index.html` in any modern web browser.
3. No build tools, Node.js, or dependencies are required!

Enjoy calculating!
