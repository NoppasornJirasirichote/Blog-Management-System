import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';


function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");


    const navigate = useNavigate();

    const goToRegister = () => {
        navigate('/Register'); 
    }


    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("กำลังส่งข้อมูลไป backend:", { email, password });
        try {
            const res = await axios.post(`https://blog-management-system-back.onrender.com/LoginPage`, {
                email,
                password
            });
            console.log("Response จาก backend:", res.data);
            navigate("/home", { state: { email: email } }); // ไปหน้า home
            setMessage(res.data.message);
        } catch (err) {
            console.log("Error Response:", err.response?.data);
            setMessage(err.response?.data?.error || "ไม่พบ email หรือ password");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto",flexDirection: "column",alignItems: "center",display: "flex" }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "300px", height: "30px", marginBottom: "10px", padding: "5px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "300px", height: "30px", marginBottom: "10px", padding: "5px" }}
                />
                <button type="submit" className={styles.butsubmit}>Login</button>
                <button onClick={goToRegister} className={styles.butregister} >register</button>
            </form>
            {message && (
                <p style={{ color: message.startsWith("Welcome") ? "green" : "red", marginTop: "10px" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default LoginPage;