const {Schema, model} = require("mongoose");

const QuestionsSchema = new Schema({
    question_title: {
        type: String,
    },
    question_image: {
        type: String,
        default: ("/images/defaultQuestionImg.png")
    },
    question_1: {
        title: {
            type: String
        },
        name: {
            type: String,
            default: 'question_1'
        }
    },
    question_2: {
        title: {
            type: String
        },
        name: {
            type: String,
            default: 'question_2'
        }
    },
    question_3: {
        title: {
            type: String
        },
        name: {
            type: String,
            default: 'question_3'
        }
    },
    question_4: {
        title: {
            type: String
        },
        name: {
            type: String,
            default: 'question_4'
        }
    },
    correct_question: {
        type: String
    },
    question_number: {
        type: Number
    }
})

const GameUsersSchema = new Schema({
    userId: {
        type: String
    }
})

const BannedUsersSchema = new Schema({
    bannedId: {
        type: String
    },
    bannedName: {
        type: String
    },
    bannedImage: {
        type: String
    }
})

const LeadersSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    correct_answers: {
        type: Number
    },
    time: {
        type: Number
    }
})

const GamesSchema = new Schema({
    game_name: {
        type: String,
        required: true
    },
    game_number: {
        type: Number
    },
    game_online: {
        users: {
            type: Object
        },
        max_online: {
            type: Number
        },
        online: {
            type: Number
        }
    },
    game_access: {
        type: String
    },
    game_expiresInSeconds: {
        type: Number
    },
    game_author: {
        type: Object
    },
    game_type: {
        type: String,
    },
    game_questions: {
        type: [QuestionsSchema],
    },
    game_users: {
        type: [GameUsersSchema]
    },
    game_leaders: {
        type: [LeadersSchema]
    },
    winnerSet: [],
    game_banned_users: {
        type: [BannedUsersSchema]
    },
    game_start_type: {
        type: String,
    },
    server_key: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresInMinutes: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 }
    },
});

GamesSchema.pre('save', function(next) {
    if (this.expiresInMinutes) {
        this.expiresAt = new Date(Date.now() + this.expiresInMinutes * 60 * 1000);
    }
    next();
});

GamesSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GamesModel = model('games', GamesSchema);

module.exports = {GamesModel}