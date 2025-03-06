document.addEventListener("DOMContentLoaded", fetchComments); // Load comments when page opens

async function fetchComments() {
    try {
        let response = await fetch('/get_comments');
        let comments = await response.json();

        let container = document.getElementById("commentsContainer");
        container.innerHTML = ""; // Clear previous comments

        comments.forEach(comment => {
            let commentBox = document.createElement("div");
            commentBox.className = "comment-box";
            commentBox.innerHTML = `<strong>${comment.customer}:</strong> ${comment.text} <br><small>${comment.created_at}</small>`;
            container.appendChild(commentBox);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

async function addComment() {
    let commentText = document.getElementById("commentInput").value.trim();
    let customerName = document.getElementById("customerName").value.trim();

    if (commentText === "" || customerName === "") {
        alert("Please enter both a name and a comment.");
        return;
    }

    try {
        let response = await fetch('/add_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: commentText, customer: customerName })
        });

        let result = await response.json();
        if (result.success) {
            fetchComments(); // Reload comments
            document.getElementById("commentInput").value = ""; // Clear input
            document.getElementById("customerName").value = ""; // Clear name field
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
