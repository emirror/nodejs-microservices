import express from 'express';
import mongoose from 'mongoose';
const app = express()
const port = 4000

app.use(express.json());


mongoose.connect('mongodb://mongo:27017/tasks').then(() =>
    console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const tasksSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', tasksSchema)

app.get('/', (req, res) => {
    res.send('Hello World from Task Service!')
})

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();   
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/tasks', async (req, res) => {
    const { title, description, userId } = req.body;
    try {
        const task = new Task({ title, description, userId });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.listen(port, () => {
    console.log(`task service listening on port ${port}`)
})
