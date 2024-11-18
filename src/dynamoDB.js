import { DynamoDBClient, } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient, ScanCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getUserInfoBySub } from './congito.js';

const client = new DynamoDBClient({
    region: process.env.region ? process.env.region : 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const TableName = "notes-backend-notes";

export const getAllNotes = async (author) => {
    const command = new QueryCommand({
        TableName: TableName,
        KeyConditionExpression:
            "author = :author",
        ExpressionAttributeValues: {
            ":author": author
        },
        ConsistentRead: true,
    });
    const response = await docClient.send(command);
    return response.Items;
};

export const getLatestNoteId = async (author) => {
    const command = new QueryCommand({
        TableName: TableName,
        KeyConditionExpression:
            "author = :author",
        ExpressionAttributeValues: {
            ":author": author
        },
        ConsistentRead: true,
        Limit: 1,
        ScanIndexForward: false
    });
    const response = await docClient.send(command);
    const id = response.Items[0] ? response.Items[0].id : NaN;
    return id
};

export const createNote = async (newTitle, newText, author) => {
    const latestNoteId = await getLatestNoteId(author);
    const id = isNaN(latestNoteId) ? 0 : latestNoteId + 1;
    const dtnow = Date.now();
    const command = new PutCommand({
        TableName: TableName,
        Item: {
            title: newTitle,
            text: newText,
            createdAt: dtnow,
            updatedAt: dtnow,
            author: author,
            id: id,
            userName: (await getUserInfoBySub(author)).Username
        },
    });

    const response = await docClient.send(command);
    return response;
};

export const getNoteById = async (id, author) => {
    const command = new ScanCommand({
        TableName: TableName,
        FilterExpression: 'author = :author and id = :id',
        ExpressionAttributeValues: {
            ':author': author,
            ':id': id
        },
    });
    const response = await docClient.send(command);
    return response.Items[0];
};

export const editNoteById = async (newTitle, newText, id, author) => {
    const item = await getNoteById(id, author);

    const command = new UpdateCommand({
        TableName: TableName,
        Key: {
            author: author,
            createdAt: item.createdAt
        },
        UpdateExpression: "set title = :newTitle, #text = :newText, updatedAt = :dtNow",
        ExpressionAttributeNames: {
            "#text": "text"
        },
        ExpressionAttributeValues: {
            ":newTitle": newTitle,
            ":newText": newText,
            ":dtNow": Date.now()
        },
        ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return response;
}

export const deleteNoteById = async (id, author) => {
    const item = await getNoteById(id, author);
    const command = new DeleteCommand({
        TableName: TableName,
        Key: {
            author: author,
            createdAt: item.createdAt
        },
    });

    const response = await docClient.send(command);
    return response;
};