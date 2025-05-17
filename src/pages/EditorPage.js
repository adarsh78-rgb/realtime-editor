import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';


const EditorPage = () => {

  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);


  useEffect(() => {

    const init = async () => {
      if (socketRef.current) return; // Prevent re-init

      socketRef.current = await initSocket();
      socketRef.current.on('connect_err', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed , try again later');
        reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      }

      );

      //listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);

          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          }
          );
          }
          
          
        );

        //listening for disconnected
        socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId,username})=>{
          toast.success(`${username} left the room.`);
          setClients((prev)=>{
            return prev.filter(
              (client) => client.socketId !== socketId)

          });
        });
    };

    init();

    return () => {

      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      // if (socketRef.current) {
      //   socketRef.current.off('connect_err');
      //   socketRef.current.off('connect_failed');
      //   socketRef.current.off(ACTIONS.JOINED);

      // }
    };

  }, []);


  async function copyRoomId(){
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Copied to Clipboard');
    } catch (err) {
      console.log(err);
      toast.error('Failed to Copy');
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to='/' />
  }








  return (
    <div className='mainWrap'>
      <div className="aside">


        <div className="asideInner">
          <div className="Logo">
            <img src="/logoCode.png" alt="Logo" className='logoImage' />

          </div>

          <h3>Connected</h3>


          <div className="clientsList">
            {
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            }

          </div>
        </div>

        <button className='btn copyBtn' onClick={copyRoomId}>Copy RoomId</button>
        <button className='btn leaveBtn' onClick={leaveRoom}>Leave Room </button>



      </div>

      <div className="editorWrap">
        <Editor 
        socketRef={socketRef} 
        roomId={roomId} 
        onCodeChange={
          (code)=>{
            codeRef.current = code;
            }} 
        />
      </div>
    </div>
  )
}

export default EditorPage
