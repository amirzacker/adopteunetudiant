import axios from "axios";
import { useEffect, useState } from "react";

export default function Pourcentage({ currentUser }) {
  const [percentage, setPercentage] = useState(0);
  const userId = currentUser?._id;  // replace with the actual user ID

  useEffect(() => {
      if (!userId) return;
    axios.get(`/api/users/${userId}`)
      .then((response) => {
        const user = response.data;
        const fields = Object.keys(user);
        let counter = 0;

        fields.forEach((field) => {
          if (user[field]) {
            counter++;
          }
        });
        const percentage = (counter / fields.length) * 100;
        setPercentage(percentage);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userId]);
  
  return (
    <div style={{all: "initial", fontSize:"20px", color: "red"}}>
 {`${Math.round(percentage)}%`}
    </div>
  );
}
