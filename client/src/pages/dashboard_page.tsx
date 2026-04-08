
async function DashBoard () {
    const data = {
        name
    };

 const res = await fetch ("api/SignIn", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
 });

 const result = await res.json();
 console.log(result);


    return (
        <div>
            <h1>Welcome Back ${result.name}</h1>
        </div>
    )
}

export default DashBoard;
