const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


router.get('/home', (req, res) => {
    res.json({ message: 'Hello World' });
});

  router.get('/post', async (req, res) => {
    try {
      let id = req.query.id;
      
      const post = await Post.findById(id).select("doc_id");
      res.json({ post: post});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error }); // Sends a response in case of an error
    }
  });

// router.get('/posts', async (req, res) => {
//     try {
//       const data = await Post.find();
//       res.json({ posts: data });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' }); // Sends a response in case of an error
//     }
//   });

  

  router.get('/posts', async (req, res) => {
    try {
      let perPage = 10;
      let page = req.query.page || 1;
      
      const data = await Post.aggregate([
        { $sort: { createdAt: -1 } },
      ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

      const count = await Post.countDocuments();
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);


      res.json({ posts: data,  nextPage: nextPage, hasNextPage: hasNextPage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error }); // Sends a response in case of an error
    }
  });

  router.get('/search', async (req, res) => {
    try {
        const input = req.query.input?.trim();
        
        // Validate input
        if (!input || input.length < 2) {
            return res.json({ posts: [] });
        }

        // Initialize session cache if it doesn't exist
        if (!req.session.searchCache) {
            req.session.searchCache = {};
        }

        // Check session cache first
        const cacheKey = input.toLowerCase();
        if (req.session.searchCache[cacheKey]) {
            console.log(`Cache hit for: ${input}`);
            return res.json({ 
                posts: req.session.searchCache[cacheKey],
                cached: true 
            });
        }

        console.log(`Searching database for: ${input}`);
        
        // Enhanced search query - searches title, content, and tags
        const posts = await Post.find(
              { title: { $regex: input, $options: 'i' } }
        )
        .select('title doc_id') // Only select needed fields
        .limit(8) // Increased limit for better autocomplete
        .sort({ createdAt: -1 }) // Most recent first
        .lean() // Faster queries
        .exec();

        // Cache the results in session (limit cache size)
        const cacheSize = Object.keys(req.session.searchCache).length;
        if (cacheSize >= 20) {
            // Clear oldest entries if cache is getting too large
            const entries = Object.entries(req.session.searchCache);
            const toDelete = entries.slice(0, 10); // Remove oldest 10 entries
            toDelete.forEach(([key]) => delete req.session.searchCache[key]);
        }

        req.session.searchCache[cacheKey] = posts;

        console.log(`Found ${posts.length} posts for: ${input}`);
        res.json({ posts: posts, cached: false });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Search failed', 
            message: error.message 
        });
    }
  });

  
module.exports = router;