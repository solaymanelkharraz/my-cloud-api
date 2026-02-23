async function testAPI() {
    try {
        const response = await fetch('http://localhost:8081/api/v1/somme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n1: 10, n2: 5 })
        });
        const data = await response.json();
        console.log("Success! API Response:", data);
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testAPI();