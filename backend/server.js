require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อม Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// API: GET users
app.get('/get', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.post('/Register', async (req, res) => {
    const { email, name, password } = req.body;

    // ตรวจสอบว่ามี email อยู่แล้ว
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single(); // ดึง 1 row

    if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = ไม่มี row ไม่ใช่ error
        console.log(checkError);
        return res.status(500).json({ error: checkError.message || "Unknown error" });
    }

    if (existingUser) {
        return res.status(400).json({ error: "email นี้เคยลงทะเบียนแล้ว" });
    }

    // insert ใหม่
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, name, password }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message || "Insert failed" });
    }

    //   res.json({ message: "Register สำเร็จ", data });
});

app.post('/LoginPage', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "กรุณากรอก email และ password" });
    }

    // ตรวจสอบผู้ใช้ใน Supabase
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return res.status(400).json({ message: "ไม่พบ email หรือ password ไม่ถูกต้อง" });
    }

    if (user.password !== password) {
        return res.status(400).json({ message: "ไม่พบ email หรือ password ไม่ถูกต้อง" });
    }

    // Login สำเร็จ
    res.json({ message: `Welcome ${user.email}` });
});

app.get('/Home', async (req, res) => {
    const { email } = req.query;

    console.log("Received email from query:", email);

    if (!email) {
        return res.status(400).json({ error: "กรุณาระบุ email" });
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
            return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }

        res.json({ username: data.name });
    } catch (err) {
        console.error("Caught error:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

app.get('/api/search-blogs', async (req, res) => {
    try {
        const { query } = req.query; // ได้ search term จาก query param
        if (!query || query.trim() === '') {
            return res.json({ blogs: [] }); // ถ้าไม่มี query ส่งคืน empty
        }

        // Query Supabase: ค้นหา header ที่มีคำค้น (case-insensitive ด้วย ilike)
        const { data: blogs, error } = await supabase
            .from('blog')
            .select('*')
            .ilike('header', `%${query}%`);

        if (error) throw error;

        res.json({ blogs }); // ส่งคืน array ของ blogs
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

app.get('/api/all-blogs', async (req, res) => {
    const { data, error } = await supabase.from('blog').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching blog with id:', id);
        const { data: blog, error } = await supabase
            .from('blog')
            .select('*')
            .eq('id', id)
            .single(); // Use .single() for a single record
        if (error) {
            console.error('Supabase fetch blog error:', error.message, error.details);
            if (error.code === 'PGRST116') { // No row found
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


app.get('/Edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching blog with id:', id);
        const { data: blog, error } = await supabase
            .from('blog')
            .select('*')
            .eq('id', id)
            .single(); // Use .single() for a single record
        if (error) {
            console.error('Supabase fetch blog error:', error.message, error.details);
            if (error.code === 'PGRST116') { // No row found
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

app.delete('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received DELETE request for id:', id); // เพิ่ม log

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
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
