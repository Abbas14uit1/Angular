// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  // JWT_SECRET: 'randomlyGeneratedKey',
  API_URL: "http://localhost:3000",
  // API_URL: "http://192.168.0.253:82",
  // API_URL: "http://qa.athlytesports.com:3000",
  sportCode: "MFB",
  googleAnalyticsKey: "UA-132545526-4",
};
