import mongoose from 'mongoose';

function isMongoAuthFailure(error) {
  return (
    error?.code === 8000 ||
    error?.codeName === 'AtlasError' ||
    /auth/i.test(error?.errmsg || error?.message || '')
  );
}

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
    if (isMongoAuthFailure(error)) {
      throw new Error(
        'MongoDB Atlas authentication failed. Verify that MONGODB_URI contains the correct Atlas username and password, that the password is URL-encoded if it has special characters, and that the user has access to this cluster.'
      );
    }

    if (error.name === 'MongooseServerSelectionError') {
      throw new Error(
        'MongoDB Atlas connection failed. Check that your current IP is allowed in Atlas Network Access, your database username/password are correct, and the cluster is running.'
      );
    }

    throw error;
  }
}
