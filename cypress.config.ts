// cypress.config.ts
import { defineConfig } from 'cypress';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export default defineConfig({
  defaultCommandTimeout: 120000, // 120 sec
  taskTimeout: 120000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      const options = webpackPreprocessor.defaultOptions;

      options.webpackOptions.resolve = {
        extensions: ['.ts', '.js'],
      };
      options.webpackOptions.module = {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
              },
            ],
          },
        ],
      };

      on('file:preprocessor', webpackPreprocessor(options));

      on('task', {
        async sendConcurrentRequests({ uploadUrl, numberOfRequests, filePath }) {
          const interval = 60000 / numberOfRequests;

          async function wait(ms: number): Promise<void> {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve();
              }, ms);
            });
          }

          async function uploadMp4File(filePath: string, uploadUrl: string, delay: number): Promise<number> {
            await wait(delay);
            console.log(`request after delay: ${delay}`);
            const formData = new FormData();

            formData.append('video', fs.createReadStream(filePath), {
              filename: 'video.mp4', // Name of the file
              contentType: 'video/mp4',
            });

            const headers = {
              ...formData.getHeaders(), // Get the form headers with the correct boundary
            };

            try {
              const response = await axios.post(uploadUrl, formData, {
                headers: headers,
                // Never throw
                validateStatus: () => true,
                timeout: 65000,
              });

              if (response.status === 200) {
                console.log('Upload successful:', response.status);
              } else {
                console.log('Error uploading: ', response.status);
              }
              return response.status;
            } catch (err) {
              console.log('Axios error');
              return 500;
            }
          }

          const requestPromises = [];
          for (let i = 0; i < numberOfRequests; i++) {
            requestPromises.push(
              uploadMp4File(filePath, uploadUrl, interval * i),
            );
          }
          // Wait for all requests to complete
          return await Promise.all(requestPromises);
        },
      });

      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
});
