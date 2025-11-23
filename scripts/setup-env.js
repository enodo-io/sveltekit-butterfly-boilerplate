#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { Client } from '@enodo/butterfly-ts';

// Enable keypress events
readline.emitKeypressEvents(process.stdin);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  brightYellow: '\x1b[93m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function selectOption(options, defaultIndex = 0) {
  return new Promise((resolve) => {
    let selectedIndex = defaultIndex;

    const render = () => {
      // Clear previous lines
      process.stdout.write('\x1b[' + (options.length + 1) + 'A');
      process.stdout.write('\x1b[0J');

      // Render options
      options.forEach((option, index) => {
        if (index === selectedIndex) {
          print('  ' + colors.brightYellow + '▶ ' + colors.bright + option + colors.reset);
        } else {
          print('    ' + colors.gray + option + colors.reset);
        }
      });
      console.log('');
    };

    const cleanup = async () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.removeListener('keypress', onKeyPress);
      // Give time for stdin to settle before readline takes over
      await new Promise((r) => setTimeout(r, 100));
    };

    const onKeyPress = async (str, key) => {
      if (key.name === 'up' && selectedIndex > 0) {
        selectedIndex--;
        render();
      } else if (key.name === 'down' && selectedIndex < options.length - 1) {
        selectedIndex++;
        render();
      } else if (key.name === 'return') {
        await cleanup();
        resolve(selectedIndex);
      } else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        await cleanup();
        console.log('');
        print('  ❌  Cancelled.', 'gray');
        console.log('');
        process.exit(0);
      }
    };

    // Initial render
    options.forEach(() => console.log(''));
    render();

    // Setup keypress listener
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('keypress', onKeyPress);
  });
}

async function testApiConnection(apiUrl, apiKey) {
  try {
    print('  🔄  Testing API connection...', 'cyan');
    console.log('');

    const client = new Client({
      domain: apiUrl,
      publicKey: apiKey,
    });

    // Test connection with a call to /v1/
    const response = await client.get({ path: '/v1/' });

    print('  ✅  Connection successful!', 'yellow');
    console.log('');
    print('     API Version: ' + colors.cyan + (response.version || 'N/A') + colors.reset, 'gray');
    print('     Status: ' + colors.cyan + 'Operational' + colors.reset, 'gray');
    console.log('');
    return true;
  } catch (error) {
    print('  ❌  API connection failed', 'yellow');
    console.log('');
    print('     Error: ' + colors.cyan + error.message + colors.reset, 'gray');
    console.log('');
    print('  ⚠️  Please verify your credentials and try again.', 'dim');
    console.log('');
    return false;
  }
}

async function main() {
  console.clear();
  console.log('');
  print('     ╭────────────────────────────────────────────────╮', 'brightYellow');
  print('     │                                                │', 'brightYellow');
  print('     │          🦋  Butterfly Setup Wizard  🦋        │', 'brightYellow');
  print('     │                                                │', 'brightYellow');
  print('     ╰────────────────────────────────────────────────╯', 'brightYellow');
  console.log('');
  print('  Welcome! This wizard will help you configure your', 'white');
  print('  Butterfly SvelteKit project step by step.', 'white');
  console.log('');

  // Ask if user wants example configuration
  print('  Use arrow keys to navigate, Enter to select', 'dim');
  console.log('');

  const choice = await selectOption(
    ['Use example configuration (for testing)', 'Configure with your real values (recommended)'],
    1, // Default to option 2 (index 1)
  );

  // Resume readline after raw mode
  rl.resume();
  console.log('');

  const envVars = {};
  const useExample = choice === 0;

  if (useExample) {
    // Use example values
    envVars.PUBLIC_BASE_URL = 'https://demo.enodo.dev';
    envVars.PUBLIC_API_URL = 'https://42.pubbtf.eno.do';
    envVars.PUBLIC_API_KEY = 'abcdef0123456789';
    envVars.PUBLIC_MEDIA_URL = 'https://42.staticbtf.eno.do';
    envVars.PUBLIC_STATIC_PAGES = '{"about":1}';
    envVars.PUBLIC_INDEXABLE = 'true';
    envVars.PUBLIC_LOCALE = 'en_US';
    envVars.PUBLIC_LANGUAGE = 'en';
    // GTM left empty for example config

    print('  ✅  Using example configuration', 'yellow');
    console.log('');
    print('  ⚠️  Remember to update these values later!', 'dim');
    console.log('');
  } else {
    // ============================================================
    // PUBLIC_BASE_URL
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  📍  Your Website URL                           │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      This is the public URL of your website.', 'gray');
    print('      Example: ' + colors.cyan + 'https://mywebsite.com' + colors.reset, 'gray');
    console.log('');
    envVars.PUBLIC_BASE_URL = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'Site URL: ' + colors.reset,
    );
    console.log('');

    // ============================================================
    // PUBLIC_API_URL
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  🌐  Butterfly API Configuration                │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      Go to: ' + colors.cyan + 'https://butterfly.enodo.app' + colors.reset, 'gray');
    print(
      '      Navigate: ' +
        colors.white +
        'Your Property > Administration > Settings' +
        colors.reset,
      'gray',
    );
    console.log('');
    print('      You will find the following values:', 'gray');
    console.log('');

    print('      ' + colors.yellow + '①' + colors.reset + '  API Domain', 'white');
    print('         Example: ' + colors.cyan + 'https://42.pubbtf.eno.do' + colors.reset, 'gray');
    console.log('');
    envVars.PUBLIC_API_URL = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'API Domain: ' + colors.reset,
    );
    console.log('');

    // ============================================================
    // PUBLIC_API_KEY
    // ============================================================
    print('      ' + colors.yellow + '②' + colors.reset + '  API Key', 'white');
    print('         A long unique string for your property', 'gray');
    console.log('');
    envVars.PUBLIC_API_KEY = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'API Key: ' + colors.reset,
    );
    console.log('');

    // ============================================================
    // PUBLIC_MEDIA_URL
    // ============================================================
    print('      ' + colors.yellow + '③' + colors.reset + '  Media Domain', 'white');
    print(
      '         Example: ' + colors.cyan + 'https://42.staticbtf.eno.do' + colors.reset,
      'gray',
    );
    console.log('');
    envVars.PUBLIC_MEDIA_URL = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'Media Domain: ' + colors.reset,
    );
    console.log('');

    // ============================================================
    // PUBLIC_STATIC_PAGES (optional)
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  📄  Static Pages (optional)                    │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      List your static pages in JSON format.', 'gray');
    print('      Format: ' + colors.cyan + '{"about":1,"legal":2}' + colors.reset, 'gray');
    console.log('');
    print(
      '      We will use them to generate site pages ' +
        colors.cyan +
        '/[slug].html' +
        colors.gray +
        ', such as legal notices.' +
        colors.reset,
      'gray',
    );
    console.log('');
    print('      Press Enter to skip.', 'dim');
    console.log('');
    const staticPages = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'Static pages (JSON): ' + colors.reset,
    );
    if (staticPages.trim()) {
      envVars.PUBLIC_STATIC_PAGES = staticPages;
    }
    console.log('');

    // ============================================================
    // INDEX_SITE
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  🔍  Search Engine Indexing                     │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      Should search engines index your site?', 'white');
    console.log('');
    print(
      '      ' + colors.yellow + 'Yes' + colors.reset + '  - Allow indexing (production sites)',
      'gray',
    );
    print(
      '      ' + colors.yellow + 'No' + colors.reset + '   - Block indexing (staging/dev sites)',
      'gray',
    );
    console.log('');
    const indexChoice = await selectOption(['Yes - Allow indexing', 'No - Block indexing'], 0);
    envVars.PUBLIC_INDEXABLE = indexChoice === 0 ? 'true' : 'false';
    console.log('');

    // ============================================================
    // LANGUAGE & LOCALE CONFIGURATION
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  🌍  Language & Locale Configuration            │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      Configure the site language and locale.', 'white');
    console.log('');

    // Validate locale format (ll_CC or ll)
    const isValidLocale = (locale) => {
      return /^[a-z]{2}(_[A-Z]{2})?$/.test(locale);
    };

    // Extract language from locale
    const extractLanguage = (locale) => {
      return locale.split('_')[0];
    };

    let locale;
    let validLocale = false;

    while (!validLocale) {
      print(
        '      Locale format: ' +
          colors.cyan +
          'll_CC' +
          colors.reset +
          ' (e.g., ' +
          colors.cyan +
          'fr_FR' +
          colors.reset +
          ', ' +
          colors.cyan +
          'en_US' +
          colors.reset +
          ')',
        'gray',
      );
      print('      Examples: fr_FR, en_US, es_ES, de_DE, it_IT', 'gray');
      console.log('');
      locale = await question(
        colors.brightYellow + '  ▶ ' + colors.white + 'Locale (e.g., fr_FR): ' + colors.reset,
      );

      if (isValidLocale(locale.trim())) {
        validLocale = true;
        locale = locale.trim();
      } else if (locale.trim() === '') {
        print('      ' + colors.yellow + '⚠️  Locale cannot be empty' + colors.reset, 'gray');
        console.log('');
      } else {
        print(
          '      ' +
            colors.yellow +
            '⚠️  Invalid locale format. Please use ll_CC (e.g., fr_FR)' +
            colors.reset,
          'gray',
        );
        console.log('');
      }
    }

    const defaultLanguage = extractLanguage(locale);
    console.log('');
    print('      Language code will be ' + colors.cyan + defaultLanguage + colors.reset, 'gray');
    console.log('');

    const language = await question(
      colors.brightYellow +
        '  ▶ ' +
        colors.white +
        'Language code [' +
        colors.cyan +
        defaultLanguage +
        colors.reset +
        ']: ',
    );

    envVars.PUBLIC_LOCALE = locale;
    envVars.PUBLIC_LANGUAGE = language.trim() || defaultLanguage;
    console.log('');

    // ============================================================
    // PUBLIC_GTM_CONTAINER_ID
    // ============================================================
    print('  ┌─────────────────────────────────────────────────┐', 'yellow');
    print('  │  📊  Google Tag Manager (optional)              │', 'yellow');
    print('  └─────────────────────────────────────────────────┘', 'yellow');
    console.log('');
    print('      Your GTM container ID (e.g., GTM-XXXXXXX)', 'gray');
    print('      This enables Google Tag Manager tracking', 'gray');
    console.log('');
    print('      Press Enter to skip.', 'dim');
    console.log('');
    const gtmId = await question(
      colors.brightYellow + '  ▶ ' + colors.white + 'GTM Container ID: ' + colors.reset,
    );
    if (gtmId.trim()) {
      envVars.PUBLIC_GTM_ID = gtmId.trim();
    }
    console.log('');
  }

  // ============================================================
  // Generate .env file
  // ============================================================
  console.log('');

  let envContent = '# Butterfly Configuration - Auto-generated\n\n';
  envContent += '# Your website public URL\n';
  envContent += `PUBLIC_BASE_URL=${envVars.PUBLIC_BASE_URL}\n\n`;
  envContent += '# Butterfly API Configuration\n';
  envContent += `PUBLIC_API_URL=${envVars.PUBLIC_API_URL}\n`;
  envContent += `PUBLIC_API_KEY=${envVars.PUBLIC_API_KEY}\n\n`;
  envContent += '# Media domain\n';
  envContent += `PUBLIC_MEDIA_URL=${envVars.PUBLIC_MEDIA_URL}\n\n`;
  envContent += '# Search engine indexing\n';
  envContent += `PUBLIC_INDEXABLE=${envVars.PUBLIC_INDEXABLE}\n`;

  if (envVars.PUBLIC_STATIC_PAGES) {
    envContent += '\n# Static pages\n';
    envContent += `PUBLIC_STATIC_PAGES='${envVars.PUBLIC_STATIC_PAGES}'\n`;
  }

  if (envVars.PUBLIC_LOCALE && envVars.PUBLIC_LANGUAGE) {
    envContent += '\n# Language & Locale\n';
    envContent += `PUBLIC_LOCALE=${envVars.PUBLIC_LOCALE}\n`;
    envContent += `PUBLIC_LANGUAGE=${envVars.PUBLIC_LANGUAGE}\n`;
  }

  if (envVars.PUBLIC_GTM_ID) {
    envContent += '\n# Google Tag Manager\n';
    envContent += `PUBLIC_GTM_ID=${envVars.PUBLIC_GTM_ID}\n`;
  }

  const envPath = path.join(process.cwd(), '.env');

  // Check if file already exists
  if (fs.existsSync(envPath)) {
    console.log('');
    print('  ⚠️  A .env file already exists!', 'yellow');
    console.log('');
    const overwrite = await question(
      colors.yellow + '  ▶ ' + colors.white + 'Overwrite? (Y/N): ' + colors.reset,
    );
    if (!['y', 'yes'].includes(overwrite.toLowerCase().trim())) {
      console.log('');
      print('  ❌  Cancelled. No files were modified.', 'gray');
      console.log('');
      rl.close();
      return;
    }
  }

  // Write the file
  fs.writeFileSync(envPath, envContent);

  console.log('');
  print('  ✅  .env file created successfully', 'yellow');
  console.log('');

  // Test API connection
  const apiTestSuccess = await testApiConnection(envVars.PUBLIC_API_URL, envVars.PUBLIC_API_KEY);

  console.log('');
  print('  ╭─────────────────────────────────────────────────╮', 'yellow');
  print('  │                                                 │', 'yellow');
  print('  │         ✨  Configuration Complete!  ✨         │', 'yellow');
  print('  │                                                 │', 'yellow');
  print('  ╰─────────────────────────────────────────────────╯', 'yellow');
  console.log('');
  print('  Your .env file is ready at the project root.', 'white');
  console.log('');

  if (!apiTestSuccess) {
    print('  ⚠️  Note:', 'yellow');
    print('     API connection test failed.', 'gray');
    print('     Please verify your credentials in the .env file', 'gray');
    console.log('');
  }

  print('  📋  Next steps:', 'yellow');
  print('     • Review the .env file content', 'gray');
  print('     • Run: ' + colors.cyan + 'npm run dev' + colors.reset, 'gray');
  if (apiTestSuccess) {
    print('     • Start building your app!', 'gray');
  } else {
    print('     • Verify your API connection', 'gray');
  }
  console.log('');
  print('  🦋  Happy coding!', 'brightYellow');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.log('');
  print('  ❌  Error: ' + error.message, 'yellow');
  console.log('');
  rl.close();
  process.exit(1);
});
