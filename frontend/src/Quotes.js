// import React, { useState } from 'react'

// function Quotes() {
//     const [text, setText] = useState("");
//     const [author, setAuthor] = useState("");
//   return (
//     <div>
//       <button>
//         gen
//       </button>

//     </div>
//   )
// }

// export default Quotes

import React, { useState, useEffect } from "react";

function Quotes() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error:", err));
  }, []); // [] = ทำครั้งเดียวตอน mount

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((u, idx) => (
          <li key={idx}>
            {u.name} ({u.email})
          </li>
        ))}

        
      </ul>
    </div>
  );
}

export default Quotes;