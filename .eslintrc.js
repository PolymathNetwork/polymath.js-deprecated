module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "airbnb-base",
    "plugin:prettier/recommended",
  ],
  "globals": {},
  "rules": {
    // Disabled AirBnb rules
    "no-console": "off",
    "no-continue": "off",
    "no-nested-ternary": "off",
    "no-underscore-dangle": "off",
    // Turn back on when it stops thinking the CLI is part of the main project
    // (how to do that?)
    "import/no-extraneous-dependencies": "off",
    "no-await-in-loop": "off", // TODO: Why did this rule exist?
    "no-plusplus": "off", // TODO: Really?
  },
};
