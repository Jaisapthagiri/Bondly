import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected',() => (
            console.log('Connected DB')
        ))
        await mongoose.connect(`${process.env.MONGODB_URL}/Bondly`)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB;