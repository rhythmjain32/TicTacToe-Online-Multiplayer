import axios from "axios"
import { useState } from "react";
import { socket } from "../services/socket";
// import { io } from "socket.io-client";
// const socket = io('https://tictactoe-onl-mult.herokuapp.com', { transports: ['websocket'] })

export default function Modal(props) {
    // socket.on("chat", (data)=>{
    //     console.log(data)
    // })
    socket.on('joinsuccess', (data)=>{
        props.modalState(false);
        // console.log(data, 'joining successful');
    })
    const [roomID, setRoomID] = useState(null)
    const [showButton, setShowButton] = useState(null);
    const [showRoomId, setShowRoomId] = useState('hidden');
    const [showJoin, setShowJoin] = useState('hidden');
    const [rcInput, setRcInput] = useState(null);
    const [showPara, setShowPara] = useState({ state: false, value: null })
    function createRoom() {
        axios.post(`https://tictactoe-onl-mult.herokuapp.com/createroom`)
            .then(res => {
                socket.emit("createroom", {room: res.data.room_id})
                props.roomcode({roomCode: res.data.room_id, input: 'X'})
                setRoomID(res.data.room_id);
                setShowRoomId(null);
                setShowButton('hidden');
                // console.log(res.data.room_id);
            })
    }

    function joinRoom() {
        setShowJoin(null);
        setShowButton('hidden');
    }

    function handleInput(e) {
        e.preventDefault();
        // console.log(e);
        // console.log(e.target.value)
        setRcInput(e.target.value)
    }

    function postRoomCode() {
        axios.post(`https://tictactoe-onl-mult.herokuapp.com/joinroom`, { rcInput })
            .then(res => {
                if (res.status == 200) {
                    props.modalState(false);
                    props.roomcode({roomCode: rcInput, input: 'O'})
                    socket.emit("joinroom", {room: rcInput})

                    // console.log('player joined')
                }
            })
            .catch(err => {
                if (err.response.status == 404) {
                    // console.log('Invalid Room Code')
                    setShowPara({ state: true, value: 'Invalid Room Code' })
                }
                console.log(err)
            })
        // console.log(rcInput);
    }

    return (
        <>
            <div className=" bg-black z-50 bg-opacity-30 inset-0 flex justify-center items-center fixed ease-in-out transition-all duration-500">
                <div className={`p-10 bg-white rounded-md flex flex-row space-x-8 ${showButton}`}>
                    <button className="hover:border-transparent hover:shadow-xs hover:bg-blue-300 w-full flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium p-4" onClick={createRoom}>Create Room</button>
                    <button className="hover:border-transparent hover:shadow-xs hover:bg-blue-300 w-full flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium p-4" onClick={joinRoom}>Join Room</button>
                </div>
                <div className={`p-10 bg-white rounded-md ${showRoomId}`}>
                    <p>Room Code : {roomID}</p>
                    <p>Waiting for another player to Join....</p>
                </div>
                <div className={`p-10 bg-white rounded-md flex flex-col space-y-4 items-center ${showJoin}`}>
                    <input
                        type="text"
                        className="focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none w-full text-sm text-black placeholder-gray-500 border border-gray-200 rounded-md py-2 text-center"
                        placeholder="Room Code"
                        name="rcinput"
                        maxLength="6"
                        onChange={handleInput}
                    />
                    <button
                        className="hover:border-transparent hover:shadow-xs hover:bg-blue-300 w-1/2 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium p-2"
                        onClick={postRoomCode}
                    >
                        Join
                    </button>
                    {showPara && (<p>{showPara.value}</p>)}
                </div>
            </div>
        </>
    )
}