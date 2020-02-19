const express = require('express');
const fs = require('fs-extra');
const crypto = require('crypto');
const email = require('../self-email');
const headers = require('../self-email/headers');
const puppeteer = require('puppeteer');

void async function () {
  // Serve the files so that we are on HTTP and not FILE protocol for CORS
  await new Promise(resolve => express().use(express.static('.')).listen(8000, resolve));

  // Create a new secret and email a link to store it at the client to myself
  if (!(await fs.pathExists('secret.js'))) {
    const secret = crypto.randomBytes(64).toString('hex');
    await fs.writeFile('secret.js', `export default '${secret}';`);
    await email(headers('WebRTC Bridge', 'New secret'), `<a href="https://tomashubelbauer.github.io/webrtc-bridge/answerer.html#${secret}">Click here to store</a>`);
    console.log(`http://localhost:5000/answerer.html#${secret}`);
    console.log(`https://tomashubelbauer.github.io/webrtc-bridge/answerer.html#${secret}`);
  }

  const browser = await puppeteer.launch({ headless: false });
  try {
    const [page] = await browser.pages();
    page.on('console', message => {
      if (message.type() === 'error') {
        throw message.text();
      }

      console.log(message.text());
    });

    await page.goto('http://localhost:8000/offerer.html');
  }
  catch (error) {
    console.log(error);
    await browser.close();
  }
}()
