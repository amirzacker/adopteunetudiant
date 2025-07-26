const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test file patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:3001/api',
      coverage: false
    },
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('@cypress/grep/src/plugin')(config)
      
      // Code coverage setup (if needed)
      if (config.env.coverage) {
        require('@cypress/code-coverage/task')(on, config)
      }
      
      return config
    },
  },
  
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },
  
  // Global configuration
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  experimentalStudio: true,
  experimentalWebKitSupport: true
})
