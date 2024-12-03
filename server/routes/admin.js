const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


router.use(cookieParser());
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


//-----------------------------ADMIN BLOCK------------------------

// login for admin
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "This is admin page"
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


// admin checkin
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});

 //Admin Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'This is dash board'
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

 //Admin - Register

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }
    
  } catch (error) {
    console.log(error);
  }
});


// logout -- currenly not using 
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});






//------------------------------POSTS------------------------



// POSTS PAGE
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Adding posts'
    }

    const data = await Post.find(); 
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});

//POST -creation
const sanitizeHtml = require('sanitize-html');

router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const sanitizedDescription = sanitizeHtml(req.body.description);  // Sanitize user input
    await Post.create({
      title: req.body.title,
      link: req.body.link,
      description: sanitizedDescription,
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving the post.");
  }
});


// POST -EDITING 

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'EDITING EXISTING POSTS',
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.error(error);
  }
});

// UPDATING - POST

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      link: req.body.link,
      description: req.body.description,
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.error(error);
  }
});
 

//POST -DELETE

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');

  } catch (error) {
    console.error(error);
  }
});

module.exports = router;