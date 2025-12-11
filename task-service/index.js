import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
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

let channel, connection;

const connectRabbitMQ = async (retries = 10, delay = 3000) => {

    while (retries) {
        try {
            connection = await amqp.connect('amqp://rabbitmq');
            channel = await connection.createChannel();
            await channel.assertQueue('task_created');
            console.log('Connected to RabbitMQ');
            return;

        } catch (err) {
            retries--;
            if (retries) {
                console.error(`Failed to connect to RabbitMQ. ${retries} reminds. Retrying in ${delay / 1000} seconds...`, err);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('Failed to connect to RabbitMQ after multiple attempts', err);
            }
        }
    }
};

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

        const message = {
            taskId : task._id,
            title,
            userId
        };

        if (!channel) {
            return res.status(503).json({ error: 'RabbitMQ channel is not available' });
        }  

        channel.sendToQueue('task_created', Buffer.from(JSON.stringify(message)));

        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.listen(port, () => {
    console.log(`task service listening on port ${port}`);
    connectRabbitMQ();
})
