import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Header from './components/Header';
import styles from './styles.module.css';

function Edit() {
    const { id } = useParams(); // ดึง id จาก URL
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [allBlogs, setAllBlogs] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [header, setHeader] = useState(""); // State สำหรับชื่อ blog
    const [blog, setBlog] = useState(""); // State สำหรับข้อความใน blog
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (email) {
                console.log("Fetching user data for email:", email);
                try {
                    const res = await axios.get(`https://blog-management-system-back.onrender.com/Home`, {
                        params: { email }
                    });
                    setUsername(res.data.username || "ไม่พบชื่อผู้ใช้");
                } catch (err) {
                    console.log("Error fetching user data:", err.response?.data);
                    setUsername("ไม่สามารถดึงชื่อผู้ใช้ได้");
                }
            } else {
                console.log("No email provided");
            }
        };

        const fetchBlog = async () => {
            if (!id) {
                setError("ไม่พบ ID ใน URL");
                setLoading(false);
                return;
            }
            try {
                console.log(`Fetching blog with id: ${id}`);
                const response = await axios.get(`https://blog-management-system-back.onrender.com/Edit/${id}`);
                console.log('Blog data:', response.data);
                setHeader(response.data.header || "");
                setBlog(response.data.blog || "");
                setError(null);
            } catch (err) {
                console.error('Error fetching blog:', err.response?.data || err.message);
                setError('ไม่สามารถดึงข้อมูล blog ได้');
            }
        };

        const fetchAllBlogs = async () => {
            try {
                console.log("Attempting to fetch all blogs from /api/all-blogs");
                const response = await axios.get(`https://blog-management-system-back.onrender.com/api/all-blogs`);
                console.log("All Blogs Response:", response.data);
                if (response.data && Array.isArray(response.data)) {
                    setAllBlogs(response.data);
                } else {
                    setAllBlogs([]);
                    console.warn("Invalid data format from /api/all-blogs");
                }
            } catch (error) {
                console.error('Fetch all blogs error:', error.message, error.response?.data);
                setError("ไม่สามารถดึงข้อมูลทั้งหมดได้");
            }
        };

        Promise.all([fetchUserData(), fetchBlog(), fetchAllBlogs()]).finally(() => setLoading(false));
    }, [email, id]);

    const handleSearch = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setError(null);
            return;
        }
        try {
            const response = await axios.get(`https://blog-management-system-back.onrender.com/api/search-blogs?query=${encodeURIComponent(term)}`);
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
            const response = await axios.get(`https://blog-management-system-back.onrender.com/api/search-blogs?query=${encodeURIComponent(searchTerm)}`);
            console.log("API Response:", response.data);
            const searchResults = response.data.blogs || response.data || [];
            console.log("Search results to send:", searchResults);
            navigate('/Home', {
                state: {
                    email,
                    searchResults,
                    searchTerm
                }
            });
        } catch (error) {
            console.error('Search error:', error);
            navigate('/Home', {
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
    const handleUpdateBlog = async (event) => {
        event.preventDefault();
        if (!header.trim() || !blog.trim()) {
            setError("กรุณากรอกชื่อ blog และข้อความ");
            return;
        }
        const blogData = {
            header,
            blog,
            created_by: username,
            created_date: new Date().toISOString().split('T')[0], // วันที่ปัจจุบัน
        };
        try {
            await axios.put(`https://blog-management-system-back.onrender.com/api/blog/${id}`, blogData);
            console.log("Blog updated successfully");
            setError(null);
            navigate('/Home', { state: { email } });
        } catch (error) {
            console.error('Error updating blog:', error.response?.data || error.message);
            setError("ไม่สามารถอัปเดต blog ได้");
        }
    };

    if (loading) return <p>กำลังโหลด...</p>;

    return (
        <div className={styles.all}>
            <Header
                username={username}
                searchTerm={searchTerm}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                email={email}
            />
            <div className={styles.list}>
                {error && <p style={{ padding: "10px", color: "red" }}>{error}</p>}
                <form onSubmit={handleUpdateBlog} style={{ width: "80%", padding: "20px" }}>
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
                                อัปเดต Blog
                            </button>
                        </div>
                        <div style={{ marginRight: "5px", width: "150px" }}>
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

export default Edit;