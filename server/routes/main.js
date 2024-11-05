const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "MBU",
      description: ""
    };

    let perPage = 10;
    let page = parseInt(req.query.page) || 1;

    const data = await Post.find({})
      .sort({ createdAt: -1 })
      .skip((perPage * (page - 1)))
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });

  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).send('Server Error');
  }
});

// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

// });


/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "",
    }

    res.render('post', { 
      locals,
      data,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
  }

});


/**
 * POST /
 * Post - searchTerm
*/
// router.post('/search', async (req, res) => {
//   try {
//     const locals = {
//       title: "Seach",
//       description: "Simple Blog created with NodeJs, Express & MongoDb."
//     }

//     let searchTerm = req.body.searchTerm;
//     const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

//     const data = await Post.find({
//       $or: [
//         { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
//         { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
//       ]
//     });

//     res.render("search", {
//       data,
//       locals,
//       currentRoute: '/'
//     });

//   } catch (error) {
//     console.log(error);
//   }

// });


/**
 * GET /
 * About
*/
// router.get('/about', (req, res) => {
//   res.render('about', {
//     currentRoute: '/about'
//   });
// });
// router.get('/', (req, res) => {
//   res.render('home', {
//     currentRoute: '/'
//   });
// });
// router.get('/contact', (req, res) => {
//   res.render('contact', {
//     currentRoute: '/contact'
//   });
// });

// Route to handle form submission
router.post('', (req, res) => {
  const { name, email, message } = req.body; // Assuming 'phone' is not used in the form

  // Configure Nodemailer with Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:  process.env.GMAIL_USER,
      pass:  process.env.GMAIL_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `Contact form submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `
  };

  // Send email
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log(error);
//       return res.render("index");
//     } else {
//       console.log('Email sent: ' + info.response);
//       return res.render("index");
//     }
//   });
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
    // Redirect back to the contact page with an error message
    return res.redirect('/'); // Adjust the path as needed
  } else {
    console.log('Email sent: ' + info.response);
    // Redirect back to the contact page with a success message
    return res.redirect('/'); // Adjust the path as needed
  }
});
});




// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     }
//   ])
// }

// insertPostData();


module.exports = router;
