import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Header from './components/Header';
import styles from './styles.module.css';

function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [allBlogs, setAllBlogs] = useState([]);
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
                    const res = await axios.get(`https://blog-management-system-back.onrender.com/Home`, {
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
                const response = await axios.get(`https://blog-management-system-back.onrender.com/api/all-blogs`);
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
        if (location.state?.searchResults) {
            setSearchResults(location.state.searchResults);
            setSearchTerm(location.state.searchTerm || ""); // อัปเดต searchTerm ถ้ามี
        }

        fetchUserData();
        fetchAllBlogs();
    }, [email, location.state]);
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
        await handleSearch(searchTerm);
    };
    const handleCreate = () => {
        navigate('/CreatePage', { state: { email } });
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
             <div className={styles.but}>
                <button className={styles.createButton} onClick={handleCreate}>
                    Create
                </button>
            </div>
            <div className={styles.list}>
                {error && <p style={{ padding: "10px", color: "red" }}>{error}</p>}
                <ul style={{ listStyle: "none" }}>
                    {(searchResults.length > 0 ? searchResults : allBlogs).map((blog) => (
                        <li key={blog.id || blog.header + blog.created_date} className={styles.blogItem}>
                            <Link
                                to={`/blog/${blog.id}`}
                                state={{ email: email }}
                                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                            >
                                <strong style={{ color: '#000000ff', paddingInlineEnd: "20px" }}>{blog.header}</strong>
                                <span style={{ color: '#808080' }}>{blog.created_date}</span>
                                <span style={{ color: '#000000ff', textAlign: "right" }}>{blog.created_by}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Home;