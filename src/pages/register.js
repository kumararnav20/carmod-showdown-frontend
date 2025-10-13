import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("${process.env.REACT_APP_API_URL}/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server");
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /><br /><br />
        <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required /><br /><br />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required /><br /><br />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  )
}

export default Register;
