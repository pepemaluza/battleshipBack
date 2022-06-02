import mongoose from "mongoose";
import UserSchema from "./user.model";

interface GameDocument extends mongoose.Document {
    status: GameStatus;
    player1Ships: ShipsPosition;
    player2Ships: ShipsPosition;
    name: string;
}

interface position { x:number, y:number }

interface ShipsPosition {
    Ship1: {pos1: position},
    Ship2: {pos1:position, pos2:position},
    Ship3: {pos1:position, pos2:position, pos3:position},
    Ship4: {pos1: position, pos2: position, pos3: position, pos4: position},
    Ship5: {pos1: position, pos2: position, pos3: position, pos4: position, pos5: position},
}

enum GameStatus {
    FINISHED,
    INGAME,
    NOTSTARTED,
}

const GameSchema = new mongoose.Schema({
    player1: {
        type: UserSchema,
        required: true,
    },
    player2: {
        type: UserSchema,
        required: true,
    },
    gameId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
});

export default mongoose.model<GameDocument>("Game", GameSchema);
