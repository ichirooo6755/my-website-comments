const commentForm = document.getElementById("comment-form");
const commentList = document.getElementById("comment-list");

// --- コメント一覧を読み込む ---
async function loadComments() {
  try {
    const res = await fetch("/.netlify/functions/getComments");
    if (!res.ok) throw new Error("getComments failed");
    const comments = await res.json();
    displayComments(comments);
    localStorage.setItem("comments", JSON.stringify(comments)); // ローカル保存
  } catch (err) {
    console.warn("サーバー接続失敗。ローカルデータを使用:", err);
    const local = JSON.parse(localStorage.getItem("comments") || "[]");
    displayComments(local);
  }
}

function displayComments(comments) {
  commentList.innerHTML = "";
  comments.forEach((c) => {
    const li = document.createElement("li");
    li.className = "comment-item";
    li.innerHTML = `<strong>${c.name}</strong><p>${c.comment}</p>`;
    commentList.appendChild(li);
  });
}

// --- コメント送信 ---
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();
  if (!name || !comment) return;

  const newComment = { name, comment };

  try {
    const res = await fetch("/.netlify/functions/addComment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });

    if (!res.ok) throw new Error("送信失敗");
    await loadComments();
  } catch (err) {
    console.error("コメント送信に失敗:", err);
    // フォールバック保存
    const local = JSON.parse(localStorage.getItem("comments") || "[]");
    local.push(newComment);
    localStorage.setItem("comments", JSON.stringify(local));
    displayComments(local);
  }

  commentForm.reset();
});

// --- 初期ロード ---
loadComments();