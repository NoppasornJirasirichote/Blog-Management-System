import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';+


function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setname] = useState("");
    const [message, setMessage] = useState("");
    const API_URL = process.env.REACT_APP_API_URL;




    const navigate = useNavigate();

    // const goToHome = () => {
    //     navigate('/Home');
    // }


    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("กำลังส่งข้อมูลไป backend:", { email, name, password });
        try {
            const res = await axios.post(`http://localhost:3000/Register`, { email, name, password });
            console.log("Response จาก backend:", res.data);
            navigate("/Home", { state: { email: email } });
            setMessage(res.data.message);
        } catch (err) {
            console.log("Error Response:", err.response?.data);
            setMessage(err.response?.data?.error || "เกิดข้อผิดพลาด");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", height: "30px", marginBottom: "10px", padding: "5px" }}
                />
                <input
                    type="name"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    required
                    minLength={4}
                    maxLength={20}
                    style={{ width: "100%", height: "30px", marginBottom: "10px", padding: "5px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{ width: "100%", height: "30px", marginBottom: "10px", padding: "5px" }}
                />
                <button type="submit" style={{ width: "100%", height: "35px", fontSize: "16px" }}>Submit</button>
            </form>
            {message && (
                <p style={{ color: message.startsWith("Welcome") ? "green" : "red", marginTop: "10px" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default Register;