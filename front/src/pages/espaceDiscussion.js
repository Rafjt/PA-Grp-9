import { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACK_URL, getCredentials, fetchDiscussions, createRoomName, fetchMessagesOfDiscussionById, storeMessage } from "../services";
import './espaceDiscussion.css';

const socket = io.connect(BACK_URL);

function EspaceDiscussion() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [oldMessages, setOldMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const credentials = await getCredentials();
        setUser(credentials);

        const discussions = await fetchDiscussions();
        setUsers(discussions);
      } catch (error) {
        console.error('Error fetching messages or users:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchOldMessages = async () => {
      if (selectedUser) {
        try {
          const data = await fetchMessagesOfDiscussionById({ 
            id_receiver: selectedUser.id, 
            type_receiver: selectedUser.type 
          });
          setOldMessages(data);
          console.log('Old messages:', data);
          console.log('Selected user:', selectedUser);
        } catch (error) {
          console.error('Error fetching old messages:', error);
        }
      }
    };

    fetchOldMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (user && users.length > 0) {
      const selectedClient = JSON.parse(localStorage.getItem('selectedClient'));
      console.log('Selected client:', selectedClient);
      if (selectedClient) {
        const client = users.find(discussion => discussion.id === selectedClient.id);
        console.log('Users:', users);
        console.log('Found client:', client);
        setSelectedUser(client);

        if (client) {
          console.log('Here:', user);
          const roomName = createRoomName(user, client);
          console.log('Room name:', roomName);
          setCurrentRoom(roomName);

          socket.emit('joinRoom', { roomName }, (error) => {
            if (error) {
              console.log('Error joining room:', error);
            }
          });
        }

        localStorage.removeItem('selectedClient');
      }
    }
  }, [user, users]);

  const sendMessage = async () => {
    if (currentRoom) {
      const messageData = {
        id_sender: user.id,
        id_receiver: selectedUser.id,
        type_sender: user.type,
        type_receiver: selectedUser.type,
        content: message,
      };

      try {
        await storeMessage(messageData);
        socket.emit("envoieMsg", { room: currentRoom, message });
        setMessages((prevMessages) => [...prevMessages, { sender: user, text: message }]);
        setMessage("");
      } catch (error) {
        console.error('Error storing message:', error);
      }
    } else {
      console.log('No room selected');
      setError('Veuillez sélectionner un utilisateur pour commencer la discussion.');
    }
  }

  useEffect(() => {
    socket.on("msgRecu", (msg) => {
      console.log(`Message received: ${JSON.stringify(msg)}`);
      if (msg.room === currentRoom) {
        setMessages((prevMessages) => [...prevMessages, { sender: null, text: msg.message }]);
      }
    });
  }, [currentRoom]);

  return (
    <div className="flex w-full h-screen bg-gradient-to-b from-blue-300 to-blue-200">
      <div className="w-1/4 h-full overflow-auto border-r-2 border-gray-300 p-4">
        {users.map((otherUser, index) => (
          <div key={index} className="mb-4" onClick={() => {
            console.log('Clicked user:', otherUser);
            console.log('Current user:', user);
            const roomName = createRoomName(user, otherUser);
            setCurrentRoom(roomName);
            console.log('Joining room:', roomName);
            socket.emit('joinRoom', { roomName });
            setSelectedUser(otherUser);
            console.log('Selected user:', otherUser);
          }}>
            <p><strong>{otherUser.nom}</strong>, {otherUser.prenom} (
              {otherUser.type === 'clientsBailleurs' ? 'Bailleur' :
                otherUser.type === 'voyageurs' ? 'Voyageur' :
                  otherUser.type === 'prestataires' ? 'Prestataire' : otherUser.type})
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center w-3/4 h-full p-4">
        <div>
          <h1>Discussion</h1>
          <hr />
          {selectedUser && (
            <p>Vous discutez maintenant avec {selectedUser.prenom} {selectedUser.nom}.</p>
          )}
          {error && <div className="alert alert-danger" role="alert">
            {error}
          </div>}
          <div className="convContainer">
            {oldMessages.map((message, index) => (
              <h1 key={index} className={message.id_sender === user.id ? "sent" : "received"}>{message.content}</h1>
            ))}
            {messages.map((message, index) => (
              <h1 key={index} className={message.sender && message.sender.id === user.id ? "sent" : "received"}>{message.text}</h1>
            ))}
          </div>
          <input type="text" placeholder="Message" className="inputDis border-2 border-black rounded-lg p-2 mt-4" value={message} onChange={(event) => {
            setMessage(event.target.value);
          }} />
          <button onClick={sendMessage} className="btnDis border-2 border-black rounded-lg p-2 mt-4">Envoyer</button>
        </div>
      </div>
    </div>
  );
}

export default EspaceDiscussion;
