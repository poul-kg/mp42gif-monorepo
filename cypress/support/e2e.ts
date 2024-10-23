// This is a support file that will be loaded before all tests.
// You can add custom commands here, import external libraries, or
// configure global settings for your tests.

// import './commands';
import 'cypress-file-upload';


// cypress/support/commands.ts

// Custom command to send multiple API requests
Cypress.Commands.add('sendLoadTestRequests', (url: string, numberOfRequests: number): Cypress.Chainable<Cypress.Response<any>[]> => {
  const requestPromises: Cypress.Chainable<Cypress.Response<any>>[] = [];
  for (let i = 0; i < numberOfRequests; i++) {
    requestPromises.push(
      cy.request({
        method: 'GET', // or 'POST', 'PUT', etc., depending on your API
        url: url,
        failOnStatusCode: false, // Allow test to continue even if some requests fail
      })
    );
  }
  // Return a chainable that resolves once all requests are completed
  return cy.wrap(Promise.all(requestPromises));
});

// Extend Cypress namespace to add the new custom command type
declare global {
  namespace Cypress {
    interface Chainable {
      sendLoadTestRequests(url: string, numberOfRequests: number): Chainable<Cypress.Response<any>[]>;
    }
  }
}

