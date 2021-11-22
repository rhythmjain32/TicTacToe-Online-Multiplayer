import Head from 'next/head'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import Modal from '../components/Modal';
import { socket } from '../services/socket';
import checkComb from '../services/gamelogic';
// import { io } from "socket.io-client";
// const socket = io('https://tictactoe-onl-mult.herokuapp.com', { transports: ['websocket'] })

export default function Home() {
  const flag = useRef(true);
  const [modal, setModal] = useState(true);
  const [room_id, setRoom_id] = useState({ roomCode: null, input: null });
  const [winner, setWinner] = useState({ found: false, player: null, play_again: false, draw: false });
  // console.log(room_id.input, 'first time assigned')
  // var room_id = 999625;
  // var assign_inp = 'X';
  const [input, setInput] = useState({
    input1: [' ', false], input2: [' ', false], input3: [' ', false], input4: [' ', false], input5: [' ', false], input6: [' ', false], input7: [' ', false], input8: [' ', false], input9: [' ', false]
  });
  const [iniInp, setIniImp] = useState('X');

  async function changeInput(e) {
    // console.log(room_id.input, 'userinput')
    if (room_id.input != iniInp) {
      // console.log(iniInp, 'iniInp');
      return;
    }
    e.preventDefault();
    if (iniInp == 'X') {
      setIniImp('O');
      socket.emit('change_xo', { value: 'O', room: room_id.roomCode })
    } else if (iniInp == 'O') {
      setIniImp('X');
      socket.emit('change_xo', { value: 'X', room: room_id.roomCode })
    }
    let name, value;
    name = e.target.name;
    var pos = name.charAt(5);
    // console.log(pos);
    value = iniInp;
    // console.log(input);
    setInput({ ...input, [name]: [value, true] })
    socket.emit('syncInput', { data: { ...input, [name]: [value, true] }, room: room_id.roomCode })
    const res = await axios.put(`https://tictactoe-onl-mult.herokuapp.com/updateinput`, { pos, room_id, iniInp })
    if (res) {
      if (iniInp == 'X') {
        if (checkComb(res.data.player1) == true) {
          setWinner({ found: true, player: 'you win', play_again: true, draw: false })
          socket.emit('playerwon', { player: 'you lose', room: room_id.roomCode })
        }
        else if (checkComb(res.data.player1) == 'draw')
          socket.emit('matchdraw', { room: room_id.roomCode, player: 'draw' })
      } else {
        if(checkComb(res.data.player2)){
          setWinner({ found: true, player: 'you win', play_again: true, draw: false })
          socket.emit('playerwon', { player: 'you lose', room: room_id.roomCode })
        } 
      }
    }
  }

  useEffect(() => {
    if (flag.current == true) {
      flag.current = false
      socket.on('change_xo', (data) => {
        // console.log(data)
        setIniImp(data.data)
      })
      socket.on('syncInput', (data) => {
        // console.log(data.data, 'sync')
        setInput(data.data)
      })
      socket.on('playerwon', (data) => {
        // console.log(data.player)
        displayWinningPlayer(data.player);
      })
      socket.on('playagain', (data) => {
        setInput(data.reset)
        setWinner({ found: false, player: null, play_again: false, draw: false });
        // room_id.input == 'X' ? setRoom_id({roomCode: data.room, input: 'O'}) : setRoom_id({roomCode: data.room, input: 'X'});
        // console.log(data.room, data.input, " roomid input1")
        setRoom_id({ roomCode: data.room, input: data.input })
        // console.log(room_id.input, " roomid input2")
        setIniImp('X');
        // console.log('1')
      })
      socket.on('matchdraw', (data) => {
        setWinner({ found: false, player: null, play_again: true, draw: true });
      })
    }
  })

  function displayWinningPlayer(playerwon) {
    setWinner({ found: true, player: playerwon, play_again: true, draw: false })
  }

  async function playAgain() {
    const res = await axios.put('https://tictactoe-onl-mult.herokuapp.com/playagain', { room_id })
    if (res) {
      if (res.status == 200) {
        if (room_id.input == 'X') {
          setRoom_id({ roomCode: room_id.roomCode, input: 'O' })
        } else {
          setRoom_id({ roomCode: room_id.roomCode, input: 'X' })
        }
        setWinner({ found: false, player: null, play_again: false, draw: false });
        setIniImp('X');
        setInput({
          input1: [' ', false], input2: [' ', false], input3: [' ', false], input4: [' ', false], input5: [' ', false], input6: [' ', false], input7: [' ', false], input8: [' ', false], input9: [' ', false]
        })
        socket.emit('playagain', {
          reset: {
            input1: [' ', false], input2: [' ', false], input3: [' ', false], input4: [' ', false], input5: [' ', false], input6: [' ', false], input7: [' ', false], input8: [' ', false], input9: [' ', false]
          }, room: room_id.roomCode, input: room_id.input
        })
      }
    }
  }

  return (
    <>

      <div className="flex flex-col items-center justify-center min-h-screen relative">
        {winner.play_again && <button onClick={playAgain} className='mb-4 mr-4 absolute bottom-0 right-0 bg-blue-500 text-white p-4 rounded hover:bg-blue-800'>Play Again</button>}
        {modal && <Modal modalState={modal => setModal(modal)} roomcode={room_id => setRoom_id(room_id)} />}
        <Head>
          <title>Tic Tac Toe</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-6xl font-bold">
            Tic Tac Toe
          </h1>

          <p className="mt-3 text-2xl">
            Online{' '}
            <code className="p-3 font-mono text-lg bg-gray-100 rounded-md">
              Multiplayer
            </code>
          </p>

          {winner.found && <h2 className="mt-3 text-lg font-bold">{winner.player}</h2>}
          {winner.draw && <h2 className="mt-3 text-lg font-bold">Match Draw</h2>}

          {/* <div className="py-50 flex flex-col"> */}
          <div className="flex flex-row items-center justify-center max-w-4xl mt-6 sm:w-full">
            <button disabled={input.input1[1]} name='input1' className={`h-40 w-40 border-b-8 text-6xl`} onClick={changeInput}>{input.input1[0]}</button>
            <button disabled={input.input2[1]} name='input2' className={`h-40 w-40 border-l-8 border-r-8 border-b-8 text-6xl`} onClick={changeInput}>{input.input2[0]}</button>
            <button disabled={input.input3[1]} name='input3' className={`h-40 w-40 border-b-8 text-6xl`} onClick={changeInput}>{input.input3[0]}</button>
          </div>
          <div className="flex flex-row items-center justify-center max-w-4xlsm:w-full">
            <button disabled={input.input4[1]} name='input4' className="h-40 w-40 border-b-8 text-6xl" onClick={changeInput}>{input.input4[0]}</button>
            <button disabled={input.input5[1]} name='input5' className="h-40 w-40 border-l-8 border-r-8 border-b-8 text-6xl" onClick={changeInput}>{input.input5[0]}</button>
            <button disabled={input.input6[1]} name='input6' className="h-40 w-40 border-b-8 text-6xl" onClick={changeInput}>{input.input6[0]}</button>
          </div>
          <div className="flex flex-row items-center justify-center max-w-4xl sm:w-full">
            <button disabled={input.input7[1]} name='input7' className="h-40 w-40 text-6xl" onClick={changeInput}>{input.input7[0]}</button>
            <button disabled={input.input8[1]} name='input8' className="h-40 w-40 border-l-8 border-r-8 text-6xl" onClick={changeInput}>{input.input8[0]}</button>
            <button disabled={input.input9[1]} name='input9' className="h-40 w-40 text-6xl" onClick={changeInput}>{input.input9[0]}</button>
          </div>
          {/* </div> */}
        </main>
      </div>
    </>
  )
}
