const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Setup method-override
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
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

// Halaman Home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Fatahillah",
      email: "fatahillahera18@gmail.com",
    },
    {
      nama: "Nugrah",
      email: "nugrah@gmail.com",
    },
    {
      nama: "Indah",
      email: "indah@gmail.com",
    },
  ];
  res.render("index", {
    title: "Halaman Home",
    nama: "Fatahillah",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

// Halaman About
app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main-layout",
  });
});

// Halaman Contact
app.get("/contact", async (req, res) => {
  //   Contact.find().then((contact) => {
  //     res.send(contact);
  //   });

  const contacts = await Contact.find();

  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

// Halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layouts/main-layout",
  });
});

// Proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama Contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No. HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // Mengirimkan flash massage
        req.flash("msg", "Data Contact berhasil ditambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

// Proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });
//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       req.flash("msg", "Data Contact berhasil dihapus!");
//       res.redirect("/contact");
//     });
//   }
// });
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data Contact berhasil dihapus!");
    res.redirect("/contact");
  });
});

// Halaman form edit data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// Proses edit data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldName && duplikat) {
        throw new Error("Nama Contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No. HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // Mengirimkan flash massage
        req.flash("msg", "Data Contact berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);

// Halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});
