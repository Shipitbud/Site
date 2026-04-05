const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Database
const db = new sqlite3.Database("db.sqlite");
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    date TEXT
)`);

// Admin password (change to something strong)
const ADMIN_PASSWORD = "Blablu3232";

// Homepage - list all posts
app.get("/", (req, res) => {
  db.all("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
    let html = `
      <html>
        <head>
          <title>Daily News</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin:auto; padding:20px; background:#f4f4f4; }
            h1 { text-align:center; }
            article { background:white; padding:15px; margin-bottom:20px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); }
            a { text-decoration:none; color:#333; }
          </style>
        </head>
        <body>
          <h1>Daily News</h1>
    `;
    rows.forEach(post => {
      html += `
        <article>
          <h2><a href="/post/${post.id}">${post.title}</a></h2>
          <small>${post.date}</small>
        </article>
      `;
    });
    html += `</body></html>`;
    res.send(html);
  });
});

// Individual post page
app.get("/post/:id", (req, res) => {
  db.get("SELECT * FROM posts WHERE id=?", [req.params.id], (err, post) => {
    if (!post) return res.send("Post not found");

    res.send(`
      <html>
        <head>
          <title>${post.title}</title>
          <style>
            body { font-family: Arial; max-width:800px; margin:auto; padding:20px; background:#f4f4f4; }
            article { background:white; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <article>
            <h1>${post.title}</h1>
            <small>${post.date}</small>
            <br><br>

            <!-- 🔴 TOP ADSTERAA SCRIPT -->
            <script src="YOUR_ADSTERAA_SCRIPT_HERE"></script>

            <p>${post.content}</p>

            <!-- 🔴 BOTTOM ADSTERAA SCRIPT -->
            <script src="YOUR_ADSTERAA_SCRIPT_HERE"></script>

            <br><a href="/">Back to homepage</a>
          </article>
        </body>
      </html>
    `);
  });
});

// Admin page
app.get("/admin", (req, res) => {
  res.send(`
    <html>
    <head><title>Admin Panel</title></head>
    <body>
      <h1>Add Post</h1>
      <form method="POST" action="/add">
        <input type="password" name="password" placeholder="Password" required /><br><br>
        <input type="text" name="title" placeholder="Title" required /><br><br>
        <textarea name="content" placeholder="Content" rows="10" cols="50" required></textarea><br><br>
        <button type="submit">Add Post</button>
      </form>
    </body>
    </html>
  `);
});

// Add post endpoint
app.post("/add", (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.send("Wrong password");
  const date = new Date().toLocaleString();
  db.run("INSERT INTO posts (title, content, date) VALUES (?, ?, ?)", 
         [req.body.title, req.body.content, date]);
  res.redirect("/");
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));
