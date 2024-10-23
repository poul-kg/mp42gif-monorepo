describe('API Load Testing', () => {
  it('should handle 100 requests per minute concurrently', () => {
    const uploadUrl = 'http://localhost:3000/convert';
    const filePath = 'cypress/fixtures/test-video.mp4';
    const requestsPerMinute = 100;
    const startTime = Date.now();
    const maxDurationInMs = 60000;

    cy.task('sendConcurrentRequests', { uploadUrl: uploadUrl, filePath: filePath, numberOfRequests: requestsPerMinute })
      .then((responseStatuses: number[]) => {
        cy.log(JSON.stringify(responseStatuses));
        // Record the end time
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        // Count the number of successful requests (status code 2xx)
        const successfulRequests = responseStatuses.filter(status => status >= 200 && status < 300).length;

        // Success rate per min
        const successPerSec = successfulRequests / elapsedTime * 1000;
        const successPerMin = Math.round(successPerSec * 60);

        // Assert that the number of successful requests is at least 100
        expect(successfulRequests).to.be.gte(requestsPerMinute, 'API should handle at least 100 requests per minute');

        // Assert that the elapsed time is within one minute
        expect(elapsedTime).to.be.lte(maxDurationInMs, `All requests should be completed within 1 minute. Current throughput is ${successPerMin} req/min`);
      });
  });
});