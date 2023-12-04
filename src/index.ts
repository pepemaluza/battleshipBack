import express from 'express';
import authRoutes from './routes/auth.route';
import mongoose from 'mongoose';
import cors from 'cors';
import { Socket } from 'socket.io';
import userModel from './models/user.model';

const http = require('http');
const socketIO = require('socket.io');

interface Room {
  player1: string;
  player1Name: string;
  player2: string;
  player2Name: string;
  status: string;
  boardA: number[][];
  boardB: number[][];
  boardAbis: number[][];
  boardBbis: number[][];
}

const emptyBoardA: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const emptyBoardB: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

mongoose
  .connect(
    'mongodb+srv://tp_dpoi_2022_MP:miescuelaF2@cluster1.4kd4y.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use('/auth', authRoutes);

    const server = http.createServer();

    const io: Socket = socketIO(server);

    var waiting: { socket: string; user: string } | null = null;

    var rooms: Room[] = [];

    function boardEquals(a: number[][], b: number[][]) {
      for (let ia = 0; ia < a.length; ia++) {
        for (let iaa = 0; iaa < a[ia].length; iaa++) {
          if (a[ia][iaa] !== b[ia][iaa]) {
            return false;
          }
        }
      }
      return true;
    }

    io.on('connection', (socket: Socket) => {
      console.log(socket.id);
      console.log('New client connected.');

      socket.on('disconnect', () => {
        console.log('Client disconnect.');
      });

      socket.on('searchRoom', (data: { socket: string; user: string }) => {
        console.log(data);
        if (waiting) {
          rooms.push({
            player1: waiting.socket,
            player1Name: waiting.user,
            player2: socket.id,
            player2Name: data.user,
            status: 'positioning',
            boardA: emptyBoardA,
            boardB: emptyBoardB,
            boardAbis: emptyBoardA,
            boardBbis: emptyBoardB,
          });
          //send signal founded to both players
          socket.emit('founded');
          socket.to(waiting.socket).emit('founded');
          waiting = null;
        } else {
          waiting = data;
        }
      });

      socket.on('ready', (data: number[][]) => {
        socket.emit('waiting');
        var r = rooms.findIndex(
          (r) => r.player1 === socket.id || r.player2 === socket.id
        );
        if (rooms[r].status === 'positioning') {
          rooms[r].status = 'waiting';
          if (rooms[r].player1 === socket.id) rooms[r].boardA = data;
          else rooms[r].boardB = data;
        } else {
          var room = rooms.find((r) => r.player1 === socket.id);
          if (room) {
            rooms[r].boardA = data;
            socket.emit('play', { play: false });
            socket.to(room.player2).emit('play', { play: true });
          }
          var room = rooms.find((r) => r.player2 === socket.id);
          if (room) {
            rooms[r].boardB = data;
            socket.emit('play', { play: false });
            socket.to(room.player1).emit('play', { play: true });
          }
          console.log(rooms[r]);
        }
      });

      socket.on('shot', (data: { x: number; y: number }) => {
        var r = rooms.findIndex(
          (r) => r.player1 === socket.id || r.player2 === socket.id
        );
        var playerA = rooms[r].player1 === socket.id;
        let p: number = 0;
        if (rooms[r][playerA ? 'boardB' : 'boardA'][data.y][data.x] === 1) {
          p = 1;
          rooms[r][playerA ? 'boardBbis' : 'boardAbis'][data.y][data.x] = 1;
        } else {
          p = 2;
        }
        console.log('Shot: ', data, socket.id);
        socket.emit('waitOpponent', { shot: p, x: data.x, y: data.y });

        if (
          boardEquals(
            rooms[r][playerA ? 'boardA' : 'boardB'],
            rooms[r][playerA ? 'boardAbis' : 'boardBbis']
          )
        ) {
          socket.emit('loss');
          socket.to(rooms[r][playerA ? 'player2' : 'player1']).emit('win');
          rooms.splice(r, 1);
        } else if (
          boardEquals(
            rooms[r][playerA ? 'boardB' : 'boardA'],
            rooms[r][playerA ? 'boardBbis' : 'boardAbis']
          )
        ) {
          socket.emit('win');
          socket.to(rooms[r][playerA ? 'player2' : 'player1']).emit('loss');
          if (playerA) {
            userModel.findOneAndUpdate(
              { email: rooms[r].player1Name },
              { $inc: { wins: 1, played: 1 } },
              { new: true },
              (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
              }
            );
            userModel.findOneAndUpdate(
              { email: rooms[r].player2Name },
              { $inc: { losses: 1, played: 1 } },
              { new: true },
              (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
              }
            );
          } else {
            userModel.findOneAndUpdate(
              { email: rooms[r].player2Name },
              { $inc: { wins: 1, played: 1 } },
              { new: true },
              (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
              }
            );
            userModel.findOneAndUpdate(
              { email: rooms[r].player1Name },
              { $inc: { losses: 1, played: 1 } },
              { new: true },
              (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
              }
            );
            rooms.splice(r, 1);
          }
        } else {
          var room = rooms.find((r) => r.player1 === socket.id);
          if (room) {
            socket.to(room.player2).emit('yourTurn', { x: data.x, y: data.y });
          }
          var room = rooms.find((r) => r.player2 === socket.id);
          if (room) {
            socket.to(room.player1).emit('yourTurn', { x: data.x, y: data.y });
          }
        }
      });
    });

    app.listen(5000, () => {
      console.log('Server has started!');
    });

    server.listen(5001, () => {
      console.log('WebSocket has started!');
    });
  });
