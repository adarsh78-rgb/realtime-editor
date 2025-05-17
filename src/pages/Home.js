import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {v4 as uuidV4} from 'uuid';



const Home = () => {

    const navigate = useNavigate();

    const [roomId , setRoomId] = useState('');
    const [username , setUsername] = useState('');


    const createNewRoom =(e)=>{

        e.preventDefault();

        const id = uuidV4();

        setRoomId(id)

        toast.success('New Room Created');

    }


    const joinRoom = () =>{

        if( !roomId || !username){
            toast.error('Room ID and Username is required');
            return;
        }

        navigate(`/editor/${roomId}`,{
            state:{
                username,
            },
        })
    }

    const handleInputEnter =(e) =>{
        if(e.code === 'Enter'){
            joinRoom();
        }
    }

  return (
    <div className='homePageWrapper'>
        <div className="formWrapper">

            <img className='homepagelogo' src="/logoCode.png" alt="logo" />
            
            <h4 className='mainLabel'>Paste invitation Room Id</h4>
            <div className="inputGroup">

                <input type="text" className='inputBox' 
                onChange={(e)=>setRoomId(e.target.value)}
                onKeyUp={handleInputEnter}
                value={roomId} placeholder='ROOM ID' />

                <input type="text" className='inputBox' onChange={(e)=>setUsername(e.target.value)}
                value={username}  
                onKeyUp={handleInputEnter}
                placeholder='USERNAME' />

                <button className='btn joinBtn' onClick={joinRoom}>Join</button>

                <span className='createInfo'>
                    Dont have invite ?   create &nbsp; 
                    <a onClick={createNewRoom} href="" className='createNewBtn'>new room</a>
                </span>

            </div>
        </div>
      <footer>
        <h4>Built by <a href="https://github.com/adarsh78-rgb">
        <b> Adarsh</b>
        </a></h4>
      </footer>
    </div>
  )
}

export default Home
