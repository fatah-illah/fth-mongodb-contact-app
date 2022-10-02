const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/fth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // Menambahkan 1 data
// const contact1 = new Contact({
//   nama: "Indah Njei",
//   nohp: "0856789123",
//   email: "njei@gmail.com",
// });

// // Simpan ke Collections
// contact1.save().then((contact) => console.log(contact));
