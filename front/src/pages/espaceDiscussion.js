import { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACK_URL, getCredentials, fetchDiscussions,createRoomName } from "../services";
import './espaceDiscussion.css';

const socket = io.connect(BACK_URL); // Replace with your server address

function EspaceDiscussion() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // New state variable for users
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const credentials = await getCredentials();
        setUser(credentials);

        const discussions = await fetchDiscussions();
        setUsers(discussions); // Store the fetched users in state
      } catch (error) {
        console.error('Error fetching messages or users:', error);
      }
    };

    fetchData();
  }, []);

  const sendMesssage = () => {
    if (currentRoom) {
      socket.emit("envoieMsg", { room: currentRoom, message });
      setMessages([...messages, { sender: user, text: message }]);
      setMessage("");
    } else {
      console.log('No room selected');
      setError('veuillez selectionner un utilisateur pour commencer la discussion.');
    }
  }

  useEffect(() => {
    socket.on("msgRecu", (msg) => {
      console.log(`Message received: ${JSON.stringify(msg)}`)
      if (msg.room === currentRoom) {
        setMessages([...messages, { sender: null, text: msg.message }]);
      }
    });
  }, [socket, messages, currentRoom]);

  return (
    <div className="flex w-full h-screen bg-gradient-to-b from-blue-300 to-blue-200">
      <div className="w-1/4 h-full overflow-auto border-r-2 border-gray-300 p-4">
        {users.map((otherUser, index) => (
          <div key={index} className="mb-4" onClick={() => {
            console.log('Clicked user:', otherUser);
            console.log('Current user:', user);
            const roomName = createRoomName(user, otherUser); // Create a room between the logged-in user and the clicked user
            setCurrentRoom(roomName);
            console.log('Joining room:', roomName);
            socket.emit('joinRoom', { roomName });
            setSelectedUser(otherUser); // Set the selected user when clicked
          }}>
            <p><strong>{otherUser.nom}</strong>, {otherUser.prenom} (
              {user.type === 'clientsBailleurs' ? 'Bailleur' :
                user.type === 'voyageurs' ? 'Voyageur' :
                  user.type === 'prestataires' ? 'Prestataire' : user.type})
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center w-3/4 h-full p-4">
        <div>
          <h1>Discussion</h1>
          <hr />
          {selectedUser && (
            <p>vous discuter maintenant avec {selectedUser.prenom} {selectedUser.nom}.</p>
          )}
          {error && <div class="alert alert-danger" role="alert">
            {error}
          </div>}
          <div className="convContainer">
            {messages.map((message, index) => (
              <h1 key={index} className={message.sender === user ? "sent" : "received"}>{message.text}</h1>
            ))}
          </div>
          <input type="text" placeholder="Message" className="inputDis border-2 border-black rounded-lg p-2 mt-4" value={message} onChange={(event) => {
            setMessage(event.target.value);
          }} />
          <button onClick={sendMesssage} className="btnDis border-2 border-black rounded-lg p-2 mt-4">Envoyer</button>
        </div>
      </div>
    </div>
  );
}

export default EspaceDiscussion;