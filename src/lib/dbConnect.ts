import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {};

async function dbConnect() {
    if(connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string || "", {
            // You can also pass some options if required
        });
        connection.isConnected = db.connections[0].readyState; // readyState is a number by default
        console.log("DB connected successfully");
    } catch (error) {
        console.error("DB connection failed", error);
        process.exit(1);
    }
}

export default dbConnect; 