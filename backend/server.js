require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ตั้งค่า CORS เพื่ออนุญาตเฉพาะ frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// เชื่อม Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Root route เพื่อทดสอบ
app.get('/', async (req, res) => {
    res.json({ message: 'Backend API is running!' });
});

// API: GET all users (ถ้าไม่ใช้ สามารถ comment ออก)
app.get('/api/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// API: Register
app.post('/Register', async (req, res) => {
    const { email, name, password } = req.body;
    console.log("Received data for register:", { email, name, password });

    // ตรวจสอบว่ามี email อยู่แล้ว
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check user error:', checkError);
        return res.status(500).json({ error: checkError.message || 'Unknown error' });
    }

    if (existingUser) {
        return res.status(400).json({ error: 'email นี้เคยลงทะเบียนแล้ว' });
    }

    // Insert user ใหม่
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, name, password }])
        .select();

    if (error) {
        console.error('Insert error:', error);
        return res.status(500).json({ error: error.message || 'Insert failed' });
    }

    res.json({ success: true, message: 'Register สำเร็จ', data });
});

// API: Login
app.post('/LoginPage', async (req, res) => {
    const { email, password } = req.body;
    console.log("Received data for login:", { email, password });

    if (!email || !password) {
        return res.status(400).json({ message: 'กรุณากรอก email และ password', success: false });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return res.status(400).json({ message: 'ไม่พบ email หรือ password ไม่ถูกต้อง', success: false });
    }

    if (user.password !== password) {
        return res.status(400).json({ message: 'ไม่พบ email หรือ password ไม่ถูกต้อง', success: false });
    }

    res.json({ success: true, message: `Welcome ${user.email}` });
});

// API: Get user data
app.get('/api/user', async (req, res) => {
    const { email } = req.query;
    console.log("Received email for user fetch:", email);

    if (!email) {
        return res.status(400).json({ error: 'กรุณาระบุ email' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('name')
            .eq('email', email)
            .maybeSingle();

        console.log("Supabase response:", { data, error });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
        }

        res.json({ username: data.name });
    } catch (err) {
        console.error("Caught error:", err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

// API: Search blogs
app.get('/api/search-blogs', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === '') {
            return res.json({ blogs: [] });
        }

        const { data: blogs, error } = await supabase
            .from('blog')
            .select('*')
            .ilike('header', `%${query}%`);

        if (error) throw error;

        res.json({ blogs });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// API: Get all blogs
app.get('/api/all-blogs', async (req, res) => {
    const { data, error } = await supabase.from('blog').select('*');
    if (error) {
        console.error('Fetch all blogs error:', error);
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

// API: Get single blog
app.get('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching blog with id:', id);
        const { data: blog, error } = await supabase
            .from('blog')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Supabase fetch blog error:', error.message, error.details);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Blog not found' });
            }
            throw error;
        }
        console.log('Blog fetched:', blog);
        res.json(blog);
    } catch (error) {
        console.error('Fetch blog error:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// API: Get blog for edit
app.get('/api/blog/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching blog for edit with id:', id);
        const { data: blog, error } = await supabase
            .from('blog')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Supabase fetch blog error:', error.message, error.details);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Blog not found' });
            }
            throw error;
        }
        console.log('Blog fetched for edit:', blog);
        res.json(blog);
    } catch (error) {
        console.error('Fetch blog error:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// API: Update blog
app.put('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { header, blog } = req.body;

        if (!header || !blog) {
            return res.status(400).json({ error: 'Header and blog are required' });
        }

        const { data, error } = await supabase
            .from('blog')
            .update({ header, blog, created_date: new Date().toISOString().split('T')[0] })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({ message: 'Blog updated successfully', data: data[0] });
    } catch (error) {
        console.error('Error updating blog:', error.message);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// API: Create blog
app.post('/api/CreatePage', async (req, res) => {
    try {
        const { header, blog, created_by, created_date } = req.body;

        if (!header || !blog || !created_by || !created_date) {
            return res.status(400).json({ error: 'All fields (header, blog, created_by, created_date) are required' });
        }

        const { data, error } = await supabase
            .from('blog')
            .insert([{ header, blog, created_by, created_date }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Blog created successfully', data: data[0] });
    } catch (error) {
        console.error('Error creating blog:', error.message);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// API: Delete blog
app.delete('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received DELETE request for id:', id);

        const { error } = await supabase
            .from('blog')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error.message);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    console.log(`Server running at ${baseUrl}`);
});
