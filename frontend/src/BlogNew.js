import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import styles from './styles.module.css';
import Header from './components/Header';

function BlogNew() {
    const { id } = useParams();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (email) {
                console.log("Fetching user data for email:", email);
                try {
                    const res = await axios.get('https://blog-management-system-fornt.onrender.com/Home', {
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

        const fetchBlog = async () => {
            if (!id) {
                setError("ไม่พบ ID ใน URL");
                setLoading(false);
                return;
            }
            try {
                console.log(`Fetching blog with id: ${id}`); // แก้ไข template literal
                const response = await axios.get(`https://blog-management-system-fornt.onrender.com/api/blog/${id}`); // ใช้ id แทน :id
                console.log('Blog data:', response.data);
                setBlog(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching blog:', err.response?.data || err.message);
                setError('ไม่สามารถดึงข้อมูล blog ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
        fetchUserData();
    }, [email, id]); // เพิ่ม id เป็น dependency

    const handleSearch = async (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setError(null);
            return;
        }
        try {
            const response = await axios.get(`https://blog-management-system-fornt.onrender.com/api/search-blogs?query=${encodeURIComponent(term)}`);
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
        const term = event.target.value;
        setSearchTerm(term);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Submit clicked with search term:", searchTerm);
        handleSearch(searchTerm);
    };
    const handleEdit = () => {
        if (blog) {
            console.log('Navigating to edit with id:', id); // เพิ่ม log เพื่อตรวจสอบ
            navigate(`/edit/${id}`, { state: { email, blog } }); // ใช้ backticks
        }
    };

    const handleDelete = async () => {
        if (blog) {
            if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ blog นี้?')) {
                try {
                    await axios.delete(`https://blog-management-system-fornt.onrender.com/api/blog/${id}`);
                    console.log('Blog deleted successfully');
                    navigate('/Home', { state: { email } }); // กลับไปหน้า Home หลังลบ
                } catch (err) {
                    console.error('Error deleting blog:', err.response?.data || err.message);
                    setError('ไม่สามารถลบ blog ได้');
                }
            }
        }
    };



    const handleBack = () => {
        navigate('/Home', { state: { email } });
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
            <div className={styles.but}>
                {blog && blog.created_by === username && (
                    <button
                        className={styles.createButton}
                        onClick={handleEdit}
                        style={{ marginRight: "10px", backgroundColor: "#ff9d00ff" }} // สีส้มเพื่อแยกจากปุ่ม Back
                    >
                        Edit
                    </button>

                )}
                {blog && blog.created_by === username && (
                    <button
                        className={styles.createButton}
                        onClick={handleDelete}
                        style={{ marginRight: "10px", backgroundColor: "#ff2a00ff" }} // สีส้มเพื่อแยกจากปุ่ม Back
                    >
                        delete
                    </button>
                )}
                <button className={styles.createButton} onClick={handleBack}>
                    Back
                </button>
            </div>

            <div className={styles.list}>
                {error && <p style={{ padding: "10px", color: "red" }}>{error}</p>}
                {blog && (
                    <div style={{ height: "100%", padding: "20px", color: "black", wordWrap: "break-word", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ height: "60px" }} >{blog.header}</h1>
                            <p style={{ minHeight: "410px" }}>{blog.blog}</p>
                        </div>
                        <div style={{ marginTop: "auto", marginBottom: "0px" }}>
                            <p style={{ height: "30px" }}><strong>เขียนวันที่:</strong> {new Date(blog.created_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style={{ height: "30px" }}><strong>ผู้เขียน:</strong> {blog.created_by}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BlogNew;