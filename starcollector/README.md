# Star Collector

A gamified task tracking and reward system designed for kids. Complete tasks to earn stars, then redeem those stars for rewards!

## Features

- **Daily and One-off Tasks**: Track recurring tasks and special one-time tasks
- **Star Rewards System**: Earn stars for completing tasks
- **Reward Redemption**: Use earned stars to claim rewards
- **Theme Customization**: Choose from 8 fun themes
- **Firebase Integration**: Sync data across devices with Firebase
- **Responsive Design**: Works on mobile and desktop devices
- **Parent Mode**: Math challenge to access edit mode

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Copy your Firebase config to `firebase-service.ts`

4. Compile TypeScript:
   ```
   tsc
   ```

5. Host the application:
   You can use any static file server like `serve` or `http-server`:
   ```
   npx serve dist
   ```

## Project Structure

- `models.ts` - Data models and interfaces
- `firebase-service.ts` - Firebase integration
- `app.ts` - Main application logic
- `utils.ts` - Utility functions and animations
- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `index.ts` - TypeScript entry point

## Build Process

The project uses TypeScript to provide type safety. The build process compiles TypeScript files to JavaScript using the `tsc` compiler.

## Dependencies

- Firebase - Authentication and Cloud database
- Google Fonts - Nunito font for clean UI

## Customization

### Adding New Themes

You can add new themes by:
1. Creating a new CSS class in `styles.css`
2. Adding the theme name to the AppData interface in `models.ts`
3. Adding the theme button to the theme options in `index.html`
4. Adding the theme emoticon switch case in `applyTheme()` in `app.ts`

## License

MIT