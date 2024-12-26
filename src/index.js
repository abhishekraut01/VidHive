import dotenv from 'dotenv';
import connectDB from './db/dbConnect.js';
import app from './app.js';

dotenv.config({ path: './.env' }); // Load environment variables

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Something went wrong while connecting to the database: ${err.message}`);
    process.exit(1); // Exit process with failure code
  });
