const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const modifiedData = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("6862520d31b50deac2936761")

    // const user = await User.findOne({ email: "yaseenmotlani309@gmail.com" });
    // owner: user._id
  }));


  await Listing.insertMany(modifiedData); // ✅ Now using modified data with owner
  console.log("data was initialized");
};


// const initDB = async () => {
//   await Listing.deleteMany({});

//   initData.data.map((obj) => ({
//     ...obj,
//     owner: "685a8d94cfea80dea32e99f3"
//   }))

//   await Listing.insertMany(initData.data);
//   console.log("data was initialized");
// };

initDB();