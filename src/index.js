import express, { json } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { createNote, deleteNoteById, editNoteById, getAllNotes, getNoteById } from './dynamoDB.js';

const app = express();
app.use(json());
app.use(cors());

app.get('/', async (req, res) => {
    res.json({ msg: "It's alive" });
});

// fetch all notes
app.get('/notes', async (req, res) => {
    res.json(await getAllNotes(req.auth.sub));
});

// fetch note by id
app.get('/notes/:id', async (req, res) => {
    res.json(await getNoteById(parseInt(req.params.id), req.auth.sub));
});

// new note
app.post('/notes', async (req, res) => {
    console.log(req.body);
    const newTitle = req.body.newTitle;
    const newText = req.body.newText;
    await createNote(newTitle, newText, req.auth.sub);
    res.json({ msg: "done" });
});

// edit note
app.patch("/notes/:id", async (req, res) => {
    const newTitle = req.body.newTitle;
    const newText = req.body.newText;
    await editNoteById(newTitle, newText, parseInt(req.params.id), req.auth.sub);
    res.json({ msg: "done" });
});

// delete note
app.delete("/notes/:id", async (req, res) => {
    await deleteNoteById(parseInt(req.params.id), req.auth.sub);
    res.json({ msg: "done" });
});

const handler = serverless(app, {
    request(req, event, context) {
        req.event = event
        req.auth = {
            username: event.requestContext.authorizer.claims["cognito:username"],
            sub: event.requestContext.authorizer.claims["sub"]
        }
    }
});

const startServer = async () => {
    app.listen(8000);
}

startServer();

const _handler = (event, context, callback) => {
    const response = handler(event, context, callback);
    return response;
};
export { _handler as handler };
