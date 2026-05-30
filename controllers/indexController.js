const bcrypt = require("bcryptjs");
const db = require("../lib/db");

const index = (req, res) => {
  res.render("index", { title: "Express" });
};

const home = (req, res) => {
  res.render("home", { title: "Home", user: req.session.name });
};

const loginPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("login", { title: "Login", error: null });
};



const login = async (req, res, next) => {
  const { name, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE name = ?", [
      name,
    ]);

    if (rows.length === 0) {
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.name = user.name;

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

const registerPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("register", { title: "Register", error: null });
};

const register = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.render("register", {
        title: "Register",
        error: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("register", {
        title: "Register",
        error: "Invalid email format",
      });
    }

    if (password !== confirmPassword) {
      return res.render("register", {
        title: "Register",
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.render("register", {
        title: "Register",
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const [existingRows] = await db.query(
      "SELECT * FROM users WHERE name = ?",
      [name]
    );

    if (existingRows.length > 0) {
      return res.render("register", {
        title: "Register",
        error: "User already exists",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (name, password, email) VALUES (?, ?, ?)", [
      name,
      hashedPassword,
      email
    ]);

    // Redirect to login
    return res.redirect("/login");
  } catch (err) {
    next(err);
  }
};

const dashboard = (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.session.name });
};

const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
};



module.exports = {
  index,
  home,
  loginPage,
  login,
  registerPage,
  register,
  dashboard,
  logout
};
