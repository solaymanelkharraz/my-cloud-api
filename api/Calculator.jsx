import React, { useState } from "react";
import axios from "axios";

export default function Calculator() {
    const [n1, setN1] = useState("");
    const [n2, setN2] = useState("");
    const [result, setResult] = useState("");

    const handleCalculate = async () => {
        try {
            // Replace 'http://localhost:8081' with your Vercel URL later!
            const res = await axios.post('http://localhost:8081/api/v1/somme', { n1, n2 });
            setResult(res.data.result);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Cloud Calculator</h2>
            <input type="number" value={n1} onChange={(e) => setN1(e.target.value)} placeholder="Number 1" />
            <input type="number" value={n2} onChange={(e) => setN2(e.target.value)} placeholder="Number 2" />
            <button onClick={handleCalculate}>Calculate Sum</button>
            {result && <p><strong>Result:</strong> {result}</p>}
        </div>
    );
}