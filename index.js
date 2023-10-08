const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
require("./utils/db");
const M_Contact = require("./model/M_Contact");
const app = express();
const port = 3000;

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override"); //! untuk method delete

//? setup method override
app.use(methodOverride("_method"));

//? setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); //! agar post tidak undefined

//? setup flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  res.render("homepage", {
    title: "homepage",
    layout: "layouts/main",
  });
});

app.get("/contact", async (req, res) => {
  const contacts = await M_Contact.find(); // Memuat data kontak
  res.render("contact", {
    title: "Data Contact",
    layout: "layouts/main",
    contacts,
    msg: req.flash("msg"),
  });
});

//? form tambah data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form tambah Contact",
    layout: "layouts/main",
  });
});

//? post tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await M_Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah ada!");
      }
      return true;
    }),
    body("email").isEmail().withMessage("Email tidak valid!"),
    body("noHp")
      .isMobilePhone("id-ID")
      .withMessage("No HP tidak valid! Harus nomor HP Indonesia."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form tambah data contact",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      M_Contact.insertMany(req.body, (err, result) => {
        //? kirimkan flash msg
        req.flash("msg", "Data Contact berhasil ditambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

//? delete contact
app.delete("/contact", async (req, res) => {
  M_Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  });
});

//? form ubah data
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await M_Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form tambah Contact",
    layout: "layouts/main",
    contact,
  });
});

//? proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await M_Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah ada!");
      }
      return true;
    }),
    body("email").isEmail().withMessage("Email tidak valid!"),
    body("noHp")
      .isMobilePhone("id-ID")
      .withMessage("No HP tidak valid! Harus nomor HP Indonesia."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form ubah data contact",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      M_Contact.updateOne(
        {
          _id: req.body._id,
        },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            noHp: req.body.noHp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Contact berhasil diupdate!");
        res.redirect("/contact");
      });
    }
  }
);

//? detail contact
app.get("/contact/:nama", async (req, res) => {
  contact = await M_Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    title: "Detail Contact",
    layout: "layouts/main",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongodb Contact App | Listening at http://localhost:${port}`);
});
