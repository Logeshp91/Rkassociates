import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    if (error.name === 'MongooseServerSelectionError') {
      throw new Error(
        'MongoDB Atlas connection failed. Check that your current IP is allowed in Atlas Network Access, your database username/password are correct, and the cluster is running.'
      );
    }

    throw error;
  }
}
