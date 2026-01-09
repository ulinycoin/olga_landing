const fetch = require('node-fetch');

const TOKEN = 'nfp_LT8cFYeqKkNYNr6d1LgzdjdLVXNpBnSN8b8b';
const SITE_ID = '07095204-b6df-419d-8a2c-eab27953188b';
const ACCOUNT_SLUG = 'auliny1974';

const envVars = [
    { key: 'NETLIFY_AUTH_TOKEN', value: TOKEN },
    { key: 'NETLIFY_SITE_ID', value: SITE_ID },
    { key: 'ADMIN_PASSWORD', value: 'admin123' }
];

async function updateEnv() {
    for (const variable of envVars) {
        console.log(`Setting ${variable.key}...`);
        const response = await fetch(`https://api.netlify.com/api/v1/accounts/${ACCOUNT_SLUG}/env?site_id=${SITE_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([
                {
                    key: variable.key,
                    values: [{ value: variable.value, context: 'all' }]
                }
            ])
        });

        if (response.ok) {
            console.log(`Successfully set ${variable.key}`);
        } else {
            const err = await response.text();
            console.error(`Failed to set ${variable.key}: ${response.status} ${err}`);
        }
    }
    console.log('Done! Now re-triggering build...');
    const buildResponse = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/builds`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });
    if (buildResponse.ok) {
        console.log('Build triggered successfully!');
    } else {
        console.error('Failed to trigger build');
    }
}

updateEnv();
