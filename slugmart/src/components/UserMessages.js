import React, { useState, useEffect, useRef } from "react"; // Import useRef to reference the chat messages container
import { useLocation } from "react-router-dom";
import { db, auth } from "../config/firebase-config";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./UserMessages.css";
import Navbar from "./Navbar";
import { handleLogout } from "../authUtil/logOut";

function UserMessages() {
  // conversation state variables
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  // Get the current location of user
  const location = useLocation();

  const messagesEndRef = useRef(null); // Create a reference for the end of the chat messages container

  // set current user on component mount and listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const messagesRef = collection(
        db,
        "messages",
        selectedConversation.id,
        "messages"
      );
      const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [selectedConversation]);

  // Function to send a message to the selected conversation
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!selectedConversation) {
      console.error("No conversation selected");
      return;
    }

    const recipientId = selectedConversation.users.find(
      (uid) => uid !== currentUser.uid
    );
    if (!recipientId) {
      console.error(
        "Recipient ID is undefined in selectedConversation:",
        selectedConversation
      );
      return;
    }

    try {
      const conversationRef = doc(db, "messages", selectedConversation.id);
      const messagesRef = collection(conversationRef, "messages");

      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        recipientId: recipientId,
        content: newMessage,
        timestamp: serverTimestamp(),
      });

      await updateDoc(conversationRef, {
        latestMessage: newMessage,
        latestMessageTimestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      const conversationRef = doc(db, "messages", conversationId);
      const messagesRef = collection(conversationRef, "messages");

      const messagesSnapshot = await getDocs(messagesRef);
      await Promise.all(
        messagesSnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref))
      );
      await deleteDoc(conversationRef);

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Select a conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  useEffect(() => {
    if (currentUser) {
      const conversationsQuery = query(
        collection(db, "messages"),
        where("users", "array-contains", currentUser.uid)
      );
      // Listen for new conversations
      const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
        const conversationPromises = snapshot.docs.map(async (docSnapshot) => {
          const conversationData = docSnapshot.data();
          const userIds = conversationData.users;

          // Fetch both usernames based on user IDs
          const userNames = await Promise.all(
            userIds.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDoc = await getDoc(userDocRef);
              return userDoc.exists() ? userDoc.data().name : "Unknown User";
            })
          );
          // Find the other user's name so we can display it in the conversation list
          const otherUserName =
            userNames.find((name) => name !== currentUser.displayName) ||
            "Seller";

          return {
            id: docSnapshot.id,
            latestMessage: conversationData.latestMessage,
            latestMessageTimestamp: conversationData.latestMessageTimestamp,
            users: userIds,
            otherUserName,
          };
        });

        const conversationsWithNames = await Promise.all(conversationPromises);
        setConversations(conversationsWithNames);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Start a new conversation if the user is redirected from listing page
  useEffect(() => {
    if (location.state && location.state.recipientId && currentUser) {
      const { recipientId, listingId, listingTitle } = location.state;

      const existingConversation = conversations.find((conv) =>
        conv.users.includes(recipientId)
      );
      // If a conversation already exists with the recipient, select it
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        const startConversation = async () => {
          const initialMessage = `Hi, I am interested in your [${listingTitle}](view-listing/${listingId})`;
          const conversationRef = await addDoc(collection(db, "messages"), {
            users: [currentUser.uid, recipientId],
            latestMessage: initialMessage,
            latestMessageTimestamp: serverTimestamp(),
          });

          setSelectedConversation({
            id: conversationRef.id,
            users: [currentUser.uid, recipientId],
            latestMessage: initialMessage,
          });
          setNewMessage(initialMessage);
        };

        startConversation();
      }
    }
  }, [location.state, currentUser, conversations]);

  // Allows the user's to press Enter to send messsage
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scrolls down to the latest messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!currentUser) {
    return <p>Please log in to view your messages.</p>;
  }

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="user-messages-container-centered">
        <div className="conversations-list">
          <h3>Conversations</h3>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedConversation?.id === conv.id ? "selected" : ""
              }`}
              onClick={() => handleSelectConversation(conv)}
            >
              <p>
                <strong>{conv.otherUserName}: &nbsp; </strong>
              </p>
              <p>
                {conv.latestMessage
                  ? `${conv.latestMessage.slice(0, 10)}...`
                  : ""}
              </p>{" "}
              {/* Truncate message preview */}
              <button
                className="delete-conversation-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="chat-container">
          {selectedConversation ? (
            <>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.senderId === currentUser.uid ? "sent" : "received"
                    }`}
                  >
                    <p className="chat-message-content">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a conversation to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserMessages;
