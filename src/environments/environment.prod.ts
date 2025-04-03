const url = 'kubemini-emr-backend-qa.azurewebsites.net';
const httpProtocol = 'https://';

// const url = 'apihospital.aviquon.com';
// const httpProtocol = 'https://';

export const environment = {
  httpProtocol,
  production: false,
  apiURL: `${httpProtocol}${url}/`,
  currency: 'IQD '
};
