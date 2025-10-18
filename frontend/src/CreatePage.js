import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from './components/Header'; // ตรวจสอบ path ให้ถูกต้อง
import styles from './styles.module.css';

function CreatePage() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [allBlogs, setAllBlogs] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [header, setHeader] = useState(""); // เพิ่ม state สำหรับชื่อ blog
    const [blog, setBlog] = useState(""); // เพิ่ม state สำหรับข้อความใน blog
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (email) {
                console.log("Fetching user data for email:", email);
                try {
                    const res = await axios.get(`http://localhost:5000/Home`, {
                        params: { email }
                    });
                    setUsername(res.data.username || "ไม่พบชื่อผู้ใช้");
                } catch (err) {
                    console.log("Error fetching user data:", err.response?.data);
                    setUsername("ไม่สามารถดึงชื่อผู้ใช้ได้");
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("No email provided");
                setLoading(false);
            }
        };
        const fetchAllBlogs = async () => {
            try {
                console.log("Attempting to fetch all blogs from /api/all-blogs");
                const response = await axios.get(`http://localhost:5000/api/all-blogs`);
                console.log("All Blogs Response:", response.data);
                if (response.data && Array.isArray(response.data)) {
                    setAllBlogs(response.data);
                    console.log("All Blogs state updated:", response.data);
                } else {
                    setAllBlogs([]);
                    console.warn("Invalid data format from /api/all-blogs");
                }
            } catch (error) {
                console.error('Fetch all blogs error:', error.message, error.response?.data);
                setError("ไม่สามารถดึงข้อมูลทั้งหมดได้");
            }
        };

        fetchUserData();
        fetchAllBlogs();
    }, [email]);

    const handleSearch = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setError(null);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/search-blogs?query=${encodeURIComponent(term)}`);
            console.log("API Response:", response.data);
            setSearchResults(response.data.blogs || []);
            setError(null);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setError("เกิดข้อผิดพลาดในการค้นหา");
        }
    };

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submit clicked with search term:", searchTerm);

        if (!searchTerm.trim()) {
            navigate('/Home', { state: { email } });
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/search-blogs?query=${encodeURIComponent(searchTerm)}`);
            console.log("API Response:", response.data);
            const searchResults = response.data.blogs || response.data || [];
            console.log("Search results to send:", searchResults);

            navigate('Home', {
                state: {
                    email,
                    searchResults,
                    searchTerm
                }
            });
        } catch (error) {
            console.error('Search error:', error);
            navigate('Home', {
                state: {
                    email,
                    searchResults: [],
                    searchTerm,
                    searchError: "เกิดข้อผิดพลาดในการค้นหา"
                }
            });
        }
    };

    const handleHome = () => {
        navigate('/Home', { state: { email } });
    };
    const handleCreateBlog = async (event) => {
        event.preventDefault();
        if (!header.trim() || !blog.trim()) {
            setError("กรุณากรอกชื่อ blog และข้อความ");
            return;
        }

        const blogData = {
            header: header,
            blog: blog,
            created_by: username,
            created_date: new Date().toISOString().split('T')[0], // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
        };

        try {
            const response = await axios.post('http://localhost:5000/api/CreatePage', blogData);
            console.log("Blog created successfully:", response.data);
            setError(null);
            setHeader("");
            setBlog("");
            navigate('/Home', { state: { email } }); // กลับไปหน้า Home หลังจากสร้างสำเร็จ
        } catch (error) {
            console.error('Error creating blog:', error.response?.data || error.message);
            setError("ไม่สามารถสร้าง blog ได้");
        }
    };

    if (loading) return <p>กำลังโหลด...</p>;

    return (
        <div style={{
            width: "100%",
            minHeight: "100vh",
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
        }}>
            <Header
                username={username}
                searchTerm={searchTerm}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                email={email}
            />
            {/* <div className={styles.butHome}>
                <button className={styles.createButtonHome} onClick={handleHome}>
                    Home
                </button>
            </div> */}
            <div className={styles.list}>
                <form onSubmit={handleCreateBlog} style={{ width: "80%", padding: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px" }}>ชื่อ Blog:</label>
                        <input
                            type="text"
                            value={header}
                            onChange={(e) => setHeader(e.target.value)}
                            style={{ width: "100%", padding: "8px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
                            placeholder="กรอกชื่อ blog"
                        />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>ข้อความใน Blog:</label>
                        <textarea
                            value={blog}
                            onChange={(e) => setBlog(e.target.value)}
                            style={{ width: "100%", padding: "8px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "150px" }}
                            placeholder="กรอกข้อความใน blog"
                        />
                    </div>

                    <div className={styles.blogcreate}>
                        <div style={{ marginRight: "5px", width: "130px" }}>
                            <button
                                type="submit"
                               className={styles.createButtonCreate}
                            >
                                สร้าง Blog
                            </button>
                        </div>
                        <div style={{ marginRight: "5px", width: "150px"}}>
                            <button className={styles.createButtonHome} onClick={handleHome}>
                                Back
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreatePage;