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
        console.log(`Updating ${variable.key}...`);
        const response = await fetch(`https://api.netlify.com/api/v1/accounts/${ACCOUNT_SLUG}/env/${variable.key}?site_id=${SITE_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [{ value: variable.value, context: 'all' }]
            })
        });

        if (response.ok) {
            console.log(`Successfully updated ${variable.key}`);
        } else {
            const err = await response.text();
            console.error(`Failed to update ${variable.key}: ${response.status} ${err}`);
        }
    }
}

updateEnv();
