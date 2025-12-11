import amqp from 'amqplib';

const start = async () => {

let channel, connection;
    try {
        connection = await amqp.connect('amqp://rabbitmq');
        channel = await connection.createChannel();
        await channel.assertQueue('task_created');
        console.log('Connected to RabbitMQ');
        console.log("notification service listening to messages")
        channel.consume('task_created', msg => {
            const message = JSON.parse(msg.content.toString());
            console.log("Received task_created message:", message);
            channel.ack(msg);
            console.log(`${message.title} has been created`);
        });
    } catch (err) {
        console.error(`Failed to connect to RabbitMQ`, err);
    }

};



start()
