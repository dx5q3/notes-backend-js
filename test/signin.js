import axios from "axios";
const signIn = async () => {
    try {
        const res = await axios.post(process.env.TEST_COGNITO_HOST, {
            AuthParameters: {
                USERNAME: process.env.TEST_USER_EMAIL,
                PASSWORD: process.env.TEST_USER_PASSWORD
            },
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.TEST_COGNITO_CLIENTID
        }, {
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
            }
        });
        console.log(res.data.AuthenticationResult.IdToken);
    } catch (error) {
        console.log(error);
    }
};

await signIn();