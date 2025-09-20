const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { ObjectId } = require('mongodb');
const { escapeRegex } = require('../utils/helper');


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
  

  router.get('/posts', async (req, res) => {
    try {
      let perPage = 10;
      let page = req.query.page || 1;
      
      const data = await Post.aggregate([
        { $sort: { createdAt: 1 } },
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
            { title: { $regex: escapeRegex(input), $options: 'i' } }
        )
        .select('title doc_id')
        .limit(8)
        .sort({ createdAt: -1 })
        .lean()
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



router.get('/search-paginated', async (req, res) => {
    try {
        const input = req.query.input?.trim();
        const id = req.query.id;
        let perPage = 10;
        let page = req.query.page || 1;
        
        // Validate input
        if ((!input //|| input.length < 2

        ) && (!id)) {
          console.log(`Hit ${input}`)
            return res.json({ 
                posts: [], 
                nextPage: 1, 
                hasNextPage: false,
                totalCount: 0,
                currentPage: parseInt(page),
                searchTerm: input
            });
        }
        // Build the search query
        const searchQuery = (input) ? { 
            title: { $regex: escapeRegex(input), $options: 'i' } 
        } : { _id: new ObjectId(id) };

        // Get paginated results using aggregation for consistency with /posts
        const data = await Post.aggregate([
            { $match: searchQuery },
            { $sort: { createdAt: -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage }
        ]).exec();

        // Get total count for pagination calculations
        const count = await Post.countDocuments(searchQuery);
        
        // Calculate pagination info
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const totalPages = Math.ceil(count / perPage);

        console.log(`Paginated search for "${input ? input : id}": page ${page}/${totalPages}, found ${data.length}/${count} posts`);

        res.json({ 
            posts: data,
            nextPage: nextPage,
            hasNextPage: hasNextPage,
            totalCount: count,
            totalPages: totalPages,
            currentPage: parseInt(page),
            searchTerm: input
        });

    } catch (error) {
        console.error('Paginated search error:', error);
        res.status(500).json({
            error: 'Paginated search failed',
            message: error.message
        });
    }
});

  
module.exports = router;