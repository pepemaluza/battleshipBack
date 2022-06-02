import mongoose from "mongoose";
import UserSchema, {UserDocument} from "./user.model";
import * as Mongoose from "mongoose";

interface GameDocument extends mongoose.Document {
    status: GameStatus;
    player1: UserDocument;
    player2: UserDocument;
    player1Ships: ShipsPosition;
    player2Ships: ShipsPosition;
    gameId: string;
}

interface position { x:number, y:number, horizontal: Boolean }

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

const ShipsSchema = new Mongoose.Schema({
    Ships: {
        Ship1: {pos1: {x: Number, y: Number, horizontal: Boolean}},
        Ship2: {pos1: {x: Number, y: Number, horizontal: Boolean}, pos2: {x: Number, y: Number, horizontal: Boolean}},
        Ship3: {
            pos1: {x: Number, y: Number, horizontal: Boolean},
            pos2: {x: Number, y: Number, horizontal: Boolean},
            pos3: {x: Number, y: Number, horizontal: Boolean}
        },
        Ship4: {
            pos1: {x: Number, y: Number, horizontal: Boolean},
            pos2: {x: Number, y: Number, horizontal: Boolean},
            pos3: {x: Number, y: Number, horizontal: Boolean},
            pos4: {x: Number, y: Number, horizontal: Boolean}
        },
        Ship5: {
            pos1: {x: Number, y: Number, horizontal: Boolean},
            pos2: {x: Number, y: Number, horizontal: Boolean},
            pos3: {x: Number, y: Number, horizontal: Boolean},
            pos4: {x: Number, y: Number, horizontal: Boolean},
            pos5: {x: Number, y: Number, horizontal: Boolean}
        },
    }
})

const GameSchema = new mongoose.Schema({
    player1: {
        type: UserSchema,
        required: true,
    },
    player2: {
        type: UserSchema,
        required: true,
    },
    player1Ships: {
        type: ShipsSchema,
        required: false,
    },
    player2Ships: {
        type: ShipsSchema,
        required: false,
    },
    gameId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
});

export default mongoose.model<GameDocument>("Game", GameSchema);
