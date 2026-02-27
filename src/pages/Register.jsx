import { useState } from "react";
import axios from "axios";

export default function Register({ setTab }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5098/api/auth/register", {
        username,
        email,
        password,
      });
      setTab("login");
    } catch (err) {
      setError("Something went wrong, please try again");
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingLeft: '40px' }}>
      <h2>Create Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      
    </div>
  );
}