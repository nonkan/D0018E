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

            // ✅ Convert item_id to a color name
            let colors = { "1": "Black", "2": "Blue", "3": "Green", "4": "Purple", "5": "Red", "6": "White" };
            let selectedCap = colors[comment.item_id] || "None";

            commentBox.innerHTML = `<strong>${comment.customer}:</strong> ${comment.text} <br>
                                    <small>${comment.created_at}</small> <br>
                                    <em>Selected Cap: ${selectedCap}</em>`;

            container.appendChild(commentBox);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

function getSelectedCap() {
    let selectedCap = document.querySelector('input[name="option"]:checked');
    return selectedCap ? selectedCap.value : ""; // ✅ Returns item_id
}

async function addComment() {
    let commentText = document.getElementById("commentInput").value.trim();
    let customerName = document.getElementById("customerName").value.trim();
    let selectedItemId = getSelectedCap();  // ✅ Get selected item_id from checkbox

    if (commentText === "" || customerName === "" || selectedItemId === "") {
        alert("Please enter a name, a comment, and select an item.");
        return;
    }

    try {
        let response = await fetch('/add_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: commentText,
                customer: customerName,
                cap: selectedItemId  // ✅ Sending item_id as "cap"
            })
        });

        let result = await response.json();
        if (result.success) {
            fetchComments(); // Reload comments
            document.getElementById("commentInput").value = ""; // Clear input
            document.getElementById("customerName").value = ""; // Clear name field
            document.querySelectorAll('input[name="option"]').forEach(checkbox => checkbox.checked = false); // Uncheck all checkboxes
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function onlyOne(checkbox) {
    document.querySelectorAll('input[name="option"]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
}
