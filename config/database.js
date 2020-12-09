const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MGOOSE_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(` MongoDB Connected: ${conn.connection.host} `.cyan.inverse);
};

module.exports = connectDB;
