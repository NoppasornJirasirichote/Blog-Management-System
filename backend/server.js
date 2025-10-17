// const express = require('express');
// const mysql = require('mysql');

// const app = express();
// app.use(express.json());

// // mysql connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'blog-management-system',
//     port: '3306'

// })

// connection.connect((err) => {
//     if(err) {
//         console.log('Error connecting to MySQL database = ', err)
//         return;
//     }
//     console.log('MySQL successfully connected!')
// })

// // create routes

// app.post("/create", async (req, res) => {
//     const { name, email, password } = req.body;
    
//     try {
//         connection.query(
//             "INSERT INTO users(name, email, password) VALUES(?, ?, ?)",
//             [name, email, password],
//             (err, results, fields) => {
//                 if(err) {
//                     console.log("Error while inserting a user into the database", err);
//                     return;
//                 }

//                 return res.status(201).json({message: "New user successfully created!"});


//             }
//         )
//     } catch(err) {
//         console.log(err);
//         return res.status(500).send();
//     }
// })

// app.listen(3000, () => console.log('Server is running on port 3000'));


// //////////////////////////////////////////////////////////////

// require('dotenv').config();
// const { createClient } = require('@supabase/supabase-js');

// // สร้าง client เชื่อม Supabase
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// // ตัวอย่าง: ดึงข้อมูลจากตาราง "users"
// async function getUsers() {
//     const { data, error } = await supabase.from('users').select('*');
//     if (error) console.error('Error fetching users:', error);
//     else console.log('Users:', data);
// }

// // ตัวอย่าง: เพิ่มข้อมูล
// async function addUser( email, name, password) {
//     const { data, error } = await supabase.from('users').insert([{ email, name, password }]).select();
//     if (error) console.error('Error adding user:', error);
//     else console.log('Added user:', data);
// }

// // ทดสอบเรียกใช้งาน
// getUsers();
// // addUser('peach4@example.com', 'Peach4', '0004');


/////////////////////////////////////////////////////////////

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { createClient } = require('@supabase/supabase-js');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // เชื่อม Supabase
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// // API: GET users
// app.get('/api/users', async (req, res) => {
//   const { data, error } = await supabase.from('users').select('*');
//   if (error) return res.status(400).json({ error: error.message });
//   res.json(data);
// });

// // API: POST user
// app.post('/api/users', async (req, res) => {
//   const { email, name, password } = req.body;
//   const { data, error } = await supabase
//     .from('users')
//     .insert([{ email, name, password }])
//     .select();

//   if (error) return res.status(400).json({ error: error.message });
//   res.json(data);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));


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
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// API: POST user
app.post('/api/users', async (req, res) => {
  const { email, name, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name, password }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));