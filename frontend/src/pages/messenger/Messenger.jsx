import "./messenger.css";
import "./dashboardM.css";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

const ENDPOINT = process.env.NODE_ENV === 'production'
  ? "wss://adopte1etudiant.onrender.com"
  : "ws://localhost:3001";
export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    socket.current = io(ENDPOINT);
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/api/conversations/" + user?.user?._id, {
          headers: { "x-access-token": user.token },
        });
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/api/messages/" + currentChat?._id, {
          headers: { "x-access-token": user.token },
        });
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user?.user?._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat?.members.find(
      (member) => member !== user?.user?._id
    );

    //socket.current = io(ENDPOINT);
    socket.current.emit("sendMessage", {
      senderId: user?.user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/api/messages", message, {
        headers: { "x-access-token": user.token },
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const Logout = () => {
    // after delete remove  localStorage
    localStorage.removeItem("user");
    //and reload page to deconnecte
    window.location.reload();
  };

  return (
    <>
      <main>
        <DashboardSidebar
          user={user}
          PF={PF}
          Logout={Logout}
          activePage="messenger"
        />

        <div className="dashboard-partition">
          <div className="messenger">
            <div className="chatMenu">
              {conversations && conversations.length > 0 ? (
                  <div className="chatMenuWrapper">
                    {conversations.map((c, i) => (
                        <div key={i} onClick={() => setCurrentChat(c)}>
                          <Conversation
                              key={i}
                              conversation={c}
                              currentUser={user?.user}
                          />
                        </div>
                    ))}
                  </div>
              ) : (
                  <span className="noConversation">
                    Pas de conversation pour le moment
                  </span>
              )}
            </div>
            <div className="chatBox">
              <div className="chatBoxWrapper">
                {currentChat ? (
                  <>
                    <div className="chatBoxTop">
                      {messages.map((m, i) => (
                        <div key={i} ref={scrollRef}>
                          <Message
                            key={i}
                            message={m}
                            currentUser={user?.user}
                            own={m.sender === user?.user?._id}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="chatBoxBottom">
                      <textarea
                        className="chatMessageInput"
                        placeholder="write something..."
                        onChange={(e) => setNewMessage(e.target.value)}
                        value={newMessage}
                      ></textarea>
                      <button
                        className="chatSubmitButton"
                        onClick={handleSubmit}
                      >
                        Envoi
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="noConversationText">
                    Ouvrir une conversation pour chatter
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
