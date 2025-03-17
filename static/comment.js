document.addEventListener("DOMContentLoaded", () => {
    fetchComments(); // Load comments when page opens
    setCustomerName(); // Set the logged-in username
});

// Set the logged-in username
function setCustomerName() {
    let loggedInUser = sessionStorage.getItem("username");

    if (!loggedInUser) {
        alert("You must be logged in to leave a comment.");
        return;
    }

    document.getElementById("customerNameDisplay").textContent = loggedInUser;
    document.getElementById("customerName").value = loggedInUser;
}

// Fetch and display comments
async function fetchComments() {
    try {
        let response = await fetch('/get_comments');
        if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);

        let comments = await response.json();
        let container = document.getElementById("commentsContainer");
        container.innerHTML = ""; // Clear previous comments

        comments.forEach(comment => {
            let commentBox = document.createElement("div");
            commentBox.className = "comment-box";

            let colors = { "1": "Black", "2": "Blue", "3": "Green", "4": "Purple", "5": "Red", "6": "White" };
            let selectedCap = colors[comment.item_id] || "None";
            let grade = comment.grade || "Not rated"; // Handle missing grade

            commentBox.innerHTML = `<strong>${comment.customer}:</strong> ${comment.text} <br>
                                    <small>${comment.created_at}</small> <br>
                                    <em>Selected Cap: ${selectedCap}</em> | <strong>Grade:</strong> ${grade}/5`;

            container.appendChild(commentBox);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// Get selected cap (returns item_id)
function getSelectedCap() {
    let selectedCap = document.querySelector('input[name="option"]:checked');
    return selectedCap ? selectedCap.value : "";
}

// Capture selected grade
function getSelectedGrade() {
    return document.getElementById("grade").value;
}

// Add a new comment
async function addComment() {
    let commentText = document.getElementById("commentInput").value.trim();
    let customerName = sessionStorage.getItem("username");
    let selectedItemId = getSelectedCap();
    let selectedGrade = getSelectedGrade();

    if (commentText === "" || selectedItemId === "") {
        alert("Please enter a comment and select an item.");
        return;
    }

    try {
        let response = await fetch('/add_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: commentText,
                customer: customerName,
                cap: selectedItemId,
                grade: selectedGrade // ✅ Send grade to backend
            })
        });

        let result = await response.json();
        if (result.success) {
            fetchComments(); // Reload comments
            resetForm(); // Clear input fields
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Allow only one checkbox to be selected
function onlyOne(checkbox) {
    document.querySelectorAll('input[name="option"]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
}

// Update displayed grade value
function updateValue(value) {
    document.getElementById("rangeValue").textContent = value;
}

// Reset form fields after posting a comment
function resetForm() {
    document.getElementById("commentInput").value = "";
    document.getElementById("grade").value = "3"; // Reset to default grade
    updateValue("3"); // Update displayed grade
    document.querySelectorAll('input[name="option"]').forEach(cb => cb.checked = false);
}
