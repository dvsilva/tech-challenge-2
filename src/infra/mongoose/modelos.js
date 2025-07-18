const mongoose = require("mongoose");
const { Schema } = mongoose;

const CardSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    number: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    functions: {
      type: String,
      required: true,
    },
    cvc: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    name: {
      type: String,
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true }
);

const AccountSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const DetailedAccountSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    anexo: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true }
);

const InvestmentSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subtype: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    initialValue: {
      type: Number,
      required: true,
    },
    currentYield: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["baixo", "medio", "alto"],
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    maturityDate: {
      type: Date,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "pt-BR",
      },
      currency: {
        type: String,
        default: "BRL",
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      emailAlerts: {
        type: Boolean,
        default: true,
      },
      smsAlerts: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        default: "light",
      },
    },
  },
  { timestamps: true }
);

// Definindo as relações virtuais
AccountSchema.virtual("cards", {
  ref: "Card",
  localField: "_id",
  foreignField: "accountId",
});

AccountSchema.virtual("investments", {
  ref: "Investment",
  localField: "_id",
  foreignField: "accountId",
});

AccountSchema.virtual("transactions", {
  ref: "DetailedAccount",
  localField: "_id",
  foreignField: "accountId",
});

UserSchema.virtual("accounts", {
  ref: "Account",
  localField: "_id",
  foreignField: "userId",
});

// Configurando as opções para que os virtuals sejam incluídos quando converter para JSON
const schemaOptions = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

AccountSchema.set(schemaOptions);
UserSchema.set(schemaOptions);

// Criando os modelos
const Card = mongoose.model("Card", CardSchema);
const Account = mongoose.model("Account", AccountSchema);
const DetailedAccount = mongoose.model(
  "DetailedAccount",
  DetailedAccountSchema
);
const Investment = mongoose.model("Investment", InvestmentSchema);
const User = mongoose.model("User", UserSchema);

module.exports = { Account, User, Investment, DetailedAccount, Card };
