document.getElementById("login_form").addEventListener("submit", function (e) {
    e.preventDefault();

    const pass = document.getElementById("pass").value.trim();

    // 認証パスワード
    if (pass === "888000") {
        window.location.href = "MFSClimited.html";
    } else {
        alert("パスワードが間違っています。");
    }
});