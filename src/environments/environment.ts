const url = 'kubemini-emr-backend-qa.azurewebsites.net';
const httpProtocol = 'https://';

// const url = '192.168.29.59/Healthcare';
// const httpProtocol = 'http://';

// const url = 'apihospital.aviquon.com'; 
// const httpProtocol = 'https://';

export const environment = {
  httpProtocol,
  production: false,
  apiURL: `${httpProtocol}${url}/`,
  currency: 'IQD '
};
