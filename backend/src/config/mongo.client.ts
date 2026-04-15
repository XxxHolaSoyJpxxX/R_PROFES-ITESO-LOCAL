import { connect } from 'mongoose';

export default async function dbConnect() {
    await connect(process.env.MONGO_URI!);
}