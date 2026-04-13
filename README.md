# Final Project

Final project of Patika+ Back-End Bootcamp.

## Description

Get to know the project:
- App involves four screens (auth, cart, home, profile)
- App language is set based on user's device's language automatically.
- Authentication functions (sign in, log in, log out) adding items into user's cart, history of purchases are stored in Firebase db.
- For localization expo-localization package has been implemented. There are three languages for example purposes.
- Local storage is used to save the user data after signing in.
- Three reducers are used for state managements; cartSlice, languageSlice and userSlice.
- With Firebase's onAuthStateChanged functionality if user closes the app and reopens, he'll still be signed in until he's logged out.
- Yup validation is implemented to validate forms.

## Getting Started

## Dependencies

This project is built with **[Expo](https://expo.dev/)** (managed workflow).

### Core
- **Expo SDK** — `~54.0.33`
- **React** — `^19.1.0`
- **React Native** — `^0.81.5` (handled by Expo)

### Key Packages
- **expo-router** — file-based routing
- **@react-navigation/native** — navigation (if not using expo-router)
- **redux-toolkit** — state management
- **firebase** — API calls
- **react-native-reanimated** — animations
- **react-native-gesture-handler** — gestures

### Development / Tooling
- **TypeScript** — `^5.9.2`
- **ESLint + Prettier** — code quality

> Full list of dependencies is in [`package.json`](package.json).

```

## Help

Expo Docs: [https://expo.dev/]
Using Firebase: [https://docs.expo.dev/guides/using-firebase/]

```

## Authors

Sinan Senkul (https://github.com/SinanSenkul)

## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the [Sinan Senkul] License - see the LICENSE.md file for details

## Support
Email me at: sinansenkul01@gmail.com
or you can text me from WP: +905536250455
