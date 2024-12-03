const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));





// GETTING HOME PAGE

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





// POST -PAGE

router.get('/post/:id', async (req, res) => {
  try {
    const slug = req.params.id;
    const data = await Post.findById(slug);
    if (!data) {
      return res.status(404).send('Post not found');
    }

    const locals = {
      title: data.title || "Post",
      description: data.description || "Detailed post view",
    };

    res.render('post', { 
      locals,
      data,
      currentRoute: `/post/${slug}`,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Server Error');
  }
});






// EMAIL MSG SENDING

router.post('', (req, res) => {
  const { name, email, message } = req.body; 

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:  process.env.GMAIL_USER,
      pass:  process.env.GMAIL_PASS
    }
  });


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

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
    return res.redirect('/'); 
  } else {
    console.log('Email sent: ' + info.response);
   
    return res.redirect('/'); 
  }
});
});

module.exports = router;
