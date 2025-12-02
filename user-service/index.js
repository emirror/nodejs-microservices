import express from 'express';
import mongoose from 'mongoose';
const app = express()
const port = 3000

app.use(express.json());


mongoose.connect('mongodb://mongo:27017/users').then(() =>
    console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const usersSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', usersSchema)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();   
        res.json(users);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = new User({ name, email });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        console.error('Error creating user', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
