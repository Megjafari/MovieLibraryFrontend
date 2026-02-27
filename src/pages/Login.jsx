import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login({ setTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5098/api/auth/login", {
        email,
        password,
      });
      login(res.data.token);
      setTab("home");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingLeft: '40px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}