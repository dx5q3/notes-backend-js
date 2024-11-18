import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({});
const userPoolId = "us-east-1_RYXuPMM7X"


export const getUserInfoBySub = async (sub) => {
    const command = new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `"sub"="${sub}"`
    });

    return (await client.send(command)).Users[0];
}