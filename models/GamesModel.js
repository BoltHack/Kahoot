const {Schema, model} = require("mongoose");

const QuestionsSchema = new Schema({
    question_title: {
        type: String,
    },
    question_image: {
        type: String,
        default: "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"
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
    game_language: {
        type: String
    },
    game_author: {
        type: Object
    },
    game_max_questions: {
        type: Number
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
    game_banned_users: {
        type: [BannedUsersSchema]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // immutable: true
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