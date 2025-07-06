import  "./message.css";
import { format } from "timeago.js";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";


export default function Message({ message, own , currentUser }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState(null);



  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("/api/users/" + message?.sender);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();

  }, [message]);

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">

        
        <img
        className="messageImg"
         src={`${ own ?  PF + currentUser?.profilePicture  :  PF + user?.profilePicture }`}
          alt="avatar sender"
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  );
}
