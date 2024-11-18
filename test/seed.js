import { createNote } from '../src/dynamoDB.js';
import { faker } from '@faker-js/faker';


for (let i = 0; i < 20; i++) {
    await createNote(faker.lorem.lines(1), faker.lorem.paragraphs(5), process.env.TEST_USER_SUB);
}