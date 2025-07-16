class User {
  constructor({ _id, name, username, email, password, settings }) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
    this.id = _id;
    this.settings = settings || {
      notifications: true,
      language: "pt-BR",
      currency: "BRL",
      twoFactorAuth: false,
      emailAlerts: true,
      smsAlerts: false,
      theme: "light",
    };
  }

  isValid() {
    return this.name && this.username && this.email && this.password;
  }
}

module.exports = User;
