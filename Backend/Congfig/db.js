import mongoose, { connect } from "mongoose";

export const connectDB = async ()=>{
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinebharat';
        await mongoose.connect(mongoURI)
        console.log('DB CONNECTED')
    } catch (error) {
        console.error('DB CONNECTION FAILED:', error.message)
        process.exit(1)
    }
}