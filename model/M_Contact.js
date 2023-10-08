const mongoose = require("mongoose");

const Contact = mongoose.model("Contact", {
  nama: {
    type: String,
    required: true,
  },
  noHp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

// //? menambah 1 data

// const contact1 = new Contact({
//   nama: "Ucup",
//   noHp: "082321226405",
//   email: "ucup@gmail.com",
// });

//? simpan ke collection

// contact1.save().then((contact) => console.log(contact));

module.exports = Contact;
