const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID } = process.env;
    const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    console.log(`Function triggered (${event.httpMethod}). Checking basic auth...`);

    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${PASSWORD}`) {
        console.warn('Unauthorized access attempt');
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    if (!NETLIFY_AUTH_TOKEN || !NETLIFY_SITE_ID) {
        console.error('Missing configuration: TOKEN or SITE_ID');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration missing' }),
        };
    }

    // Handle DELETE request
    if (event.httpMethod === 'DELETE') {
        try {
            const body = JSON.parse(event.body);
            const { submissionId } = body;

            if (!submissionId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Submission ID is required' }),
                };
            }

            console.log(`Deleting submission ID: ${submissionId}...`);
            const deleteResponse = await fetch(
                `https://api.netlify.com/api/v1/submissions/${submissionId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
                    },
                }
            );

            if (!deleteResponse.ok) {
                const errText = await deleteResponse.text();
                console.error(`Netlify API Error (Delete): ${deleteResponse.status} ${errText}`);
                throw new Error(`Failed to delete submission: ${deleteResponse.statusText}`);
            }

            console.log('Successfully deleted submission.');
            return {
                statusCode: 204,
                body: '',
            };
        } catch (error) {
            console.error('Error during deletion:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message }),
            };
        }
    }

    // Existing GET logic...
    try {
        console.log(`Fetching forms for Site ID: ${NETLIFY_SITE_ID}...`);
        const response = await fetch(
            `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/forms`,
            {
                headers: {
                    Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Netlify API Error (Forms): ${response.status} ${errText}`);
            throw new Error(`Netlify API error: ${response.statusText}`);
        }

        const forms = await response.json();
        const surveyForm = forms.find(f => f.name === 'nutricionist-survey');

        if (!surveyForm) {
            console.warn('Form "nutricionist-survey" not found in Netlify.');
            return {
                statusCode: 200,
                body: JSON.stringify([]),
            };
        }

        console.log(`Fetching submissions for Form ID: ${surveyForm.id}...`);
        const submissionsResponse = await fetch(
            `https://api.netlify.com/api/v1/forms/${surveyForm.id}/submissions`,
            {
                headers: {
                    Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
                },
            }
        );

        if (!submissionsResponse.ok) {
            const errText = await submissionsResponse.text();
            console.error(`Netlify API Error (Submissions): ${submissionsResponse.status} ${errText}`);
            throw new Error(`Failed to fetch submissions: ${submissionsResponse.statusText}`);
        }

        const submissions = await submissionsResponse.json();
        console.log(`Successfully fetched ${submissions.length} submissions.`);

        const formattedSubmissions = submissions.map(sub => {
            const data = sub.data;
            const answers = {};

            Object.keys(data).forEach(key => {
                if (key.startsWith('q')) {
                    const qId = parseInt(key.substring(1));
                    answers[qId] = data[key];
                }
            });

            return {
                id: sub.id,
                date: sub.created_at,
                surveyId: data['survey-id'] || 'adult',
                surveyTitle: data['survey-title'] || 'Опросник',
                answers: answers
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(formattedSubmissions),
        };
    } catch (error) {
        console.error('Fatal error in function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
