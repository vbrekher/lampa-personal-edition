import {fileURLToPath} from 'node:url';
import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',outputDir:'../../reports/ui-test-results',timeout:45000,
  expect:{timeout:15000},fullyParallel:true,workers:2,retries:0,
  reporter:[['list'],['json',{outputFile:fileURLToPath(new URL('../../reports/ui-matrix.json',import.meta.url))}]],
  use:{baseURL:'http://127.0.0.1:8766',browserName:process.env.QA_BROWSER||'chromium',trace:'retain-on-failure'},
  webServer:{cwd:fileURLToPath(new URL('../../',import.meta.url)),command:'node personal/qa/server.mjs',url:'http://127.0.0.1:8766',reuseExistingServer:false,timeout:30000}
});
